import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PaymentStatus } from '@prisma/client'
import { ORDER_STATUS, OrderStatusType } from 'src/shared/constants/order.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import { PaymentMethodRepository } from '../payment/paymentMethod.repo'
import { DeliveryMethodRepository } from '../delivery-method/delivery-method.repo'
import {
  CancelOrderResType,
  CreateOrderBodyType,
  CreateOrderResType,
  GetOrderDetailResType,
  GetOrderListResType,
} from './order.model'

@Injectable()
export class OrderRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly paymentMethodRepo: PaymentMethodRepository,
    private readonly deliveryMethodRepo: DeliveryMethodRepository,
  ) {}

  async list({
    userId,
    limit,
    page,
    status,
  }: {
    userId: number
    limit: number
    page: number
    status?: OrderStatusType
  }): Promise<GetOrderListResType> {
    const offset = (page - 1) * limit
    let where = {
      userId: userId,
      status: status ? status : undefined,
    }
    const [totalItems, data] = await Promise.all([
      this.prismaService.order.count({
        where,
      }),
      this.prismaService.order.findMany({
        where: where,
        skip: offset,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: true,
        },
        omit: {
          receiver: true,
          deletedAt: true,
        },
      }),
    ])

    return {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      data,
    }
  }

  async create(
    userId: number, // Từ auth (người mua)
    body: CreateOrderBodyType, // Array group theo shop
  ): Promise<CreateOrderResType> {
    return await this.prismaService.$transaction(async (tx) => {
      // Validate các payment method codes trước khi xử lý
      const paymentMethodCodes = [...new Set(body.map((item) => item.paymentMethodCode))]
      const paymentMethods = await Promise.all(
        paymentMethodCodes.map((code) => this.paymentMethodRepo.findByCode(code)),
      )

      // Kiểm tra tất cả payment methods có tồn tại và active không
      for (const paymentMethod of paymentMethods) {
        if (!paymentMethod) {
          throw new BadRequestException('Phương thức thanh toán không tồn tại')
        }
        if (!paymentMethod.isActive) {
          throw new BadRequestException(`Phương thức thanh toán ${paymentMethod.name} đã bị vô hiệu hóa`)
        }
      }

      // Tạo map để dễ tra cứu payment method
      const paymentMethodMap = new Map(paymentMethods.filter(Boolean).map((pm) => [pm!.code, pm!]))

      // Validate các delivery method codes
      const deliveryMethodCodes = [...new Set(body.map((item) => item.deliveryMethodCode))]
      const deliveryMethods = await Promise.all(
        deliveryMethodCodes.map((code) => this.deliveryMethodRepo.findByCode(code)),
      )

      for (const deliveryMethod of deliveryMethods) {
        if (!deliveryMethod) {
          throw new BadRequestException('Phương thức vận chuyển không tồn tại')
        }
        if (!deliveryMethod.isActive) {
          throw new BadRequestException(`Phương thức vận chuyển ${deliveryMethod.name} đã bị vô hiệu hóa`)
        }
      }

      // Tạo map để dễ tra cứu delivery method
      const deliveryMethodMap = new Map(deliveryMethods.filter(Boolean).map((dm) => [dm!.code, dm!]))

      // lấy ra các id cartItem trong tất cả các group đóng lại thành 1 mảng
      const allCartItemsId = body.flatMap((item) => item.cartItemIds)

      // Lấy ra tất cả cartItem dựa trên các id và userId
      const cartItems = await tx.cartItem.findMany({
        where: {
          id: {
            // Lấy tất cả cart item id trong mảng
            in: allCartItemsId,
          },
          userId,
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: true,
                },
              },
            },
          },
        },
      })

      // Kiểm tra xem cartitem có tồn tại ko
      if (cartItems.length !== allCartItemsId.length) {
        throw new BadRequestException('Không tìm thấy sản phẩm trong giỏ hàng')
      }

      const isOutOfStock = cartItems.some((item) => {
        return item.sku.stock < item.quantity
      })

      // Kiểm tra xem kho còn đủ hàng tồn ko
      if (isOutOfStock) {
        throw new BadRequestException('Kho không đủ hàng tồn')
      }

      const hasInvalidProduct = cartItems.some((item) => {
        const p = item.sku.product
        return p.deletedAt !== null || p.publishedAt === null || (p.publishedAt && p.publishedAt > new Date())
      })

      //
      if (hasInvalidProduct) {
        throw new BadRequestException('Sản phẩm đã bị xóa hoặc chưa được đăng')
      }

      // kiểm tra xem các skuid trong cartItem có thuộc về shop đó ko
      const cartItemMap = new Map(cartItems.map((item) => [item.id, item]))

      for (const group of body) {
        const groupItems = group.cartItemIds.map((id) => cartItemMap.get(id)).filter(Boolean)

        if (groupItems.length !== group.cartItemIds.length) {
          throw new BadRequestException('Không tìm thấy sản phẩm trong giỏ hàng của shop này')
        }

        // Check tất cả sản phẩm thuộc đúng shop
        const shopIds = new Set(groupItems.map((item) => item.sku.product.createdById))
        if (shopIds.size !== 1 || !shopIds.has(group.shopId)) {
          throw new BadRequestException('Một số sản phẩm không thuộc shop này')
        }

        // cập nahajt lại số lượng sản phẩm của tưởn product sku
        for (const item of groupItems) {
          await tx.sKU.update({
            where: { id: item.skuId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      }

      const orders = await Promise.all(
        body.map(async (item) => {
          const groupCartItems = item.cartItemIds.map((id) => cartItemMap.get(id)).filter(Boolean)

          // Tính tổng tiền sản phẩm cho order này
          const productTotal = groupCartItems.reduce(
            (total, cartItem) => total + cartItem!.sku.price * cartItem!.quantity,
            0,
          )

          const paymentMethod = paymentMethodMap.get(item.paymentMethodCode)!
          const deliveryMethod = deliveryMethodMap.get(item.deliveryMethodCode)!

          // Phí vận chuyển
          const shippingFee = deliveryMethod.price

          // Tổng tiền thanh toán = tiền sản phẩm + phí vận chuyển
          const totalAmount = productTotal + shippingFee

          const order = await tx.order.create({
            data: {
              user: {
                connect: { id: userId },
              },
              shop: {
                connect: { id: item.shopId },
              },
              status: ORDER_STATUS.PENDING_PAYMENT,
              receiver: {
                name: item.receiver.name,
                phone: item.receiver.phone,
                address: item.receiver.address,
              },
              deliveryMethod: {
                connect: { id: deliveryMethod.id },
              },
              shippingFee: shippingFee,
              payment: {
                create: {
                  status: PaymentStatus.PENDING,
                  paymentMethodId: paymentMethod.id,
                  amount: totalAmount,
                },
              },

              items: {
                create: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)
                  return {
                    productName: cartItem!.sku.product.name,
                    skuPrice: cartItem!.sku.price,
                    image: cartItem!.sku.image,
                    skuValue: cartItem!.sku.value,
                    skuId: cartItem!.skuId,
                    productId: cartItem!.sku.product.id,
                    quantity: cartItem!.quantity,
                    productTranslations: cartItem!.sku.product.productTranslations.map((pt) => {
                      return {
                        name: pt.name,
                        description: pt.description,
                        languageId: pt.languageId,
                      }
                    }),
                  }
                }),
              },
              products: {
                connect: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)
                  return { id: cartItem!.sku.product.id }
                }),
              },
            },
            include: {
              payment: {
                include: {
                  paymentMethod: true,
                },
              },
              deliveryMethod: true,
            },
          })
          // Thêm các trường productTotal, shippingFee, totalAmount vào kết quả trả về
          return {
            ...order,
            productTotal,
            shippingFee,
            totalAmount,
          }
        }),
      )

      await tx.cartItem.deleteMany({
        where: {
          id: { in: allCartItemsId },
          userId,
        },
      })

      return { data: orders }
    })
  }

  async findDetailOrder(userId: number, orderId: number): Promise<GetOrderDetailResType> {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId: userId,
        deletedAt: null,
      },
      include: {
        items: true,
        payment: true,
      },
    })
    if (!order) {
      throw new BadRequestException('Không tìm thấy đơn hàng')
    }
    return order
  }

  async cancelOrder(userId: number, orderId: number): Promise<CancelOrderResType> {
    return this.prismaService.$transaction(async (tx) => {
      // 1. Lấy order + include các thông tin cần thiết
      const order = await tx.order.findUnique({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        include: {
          payment: true, // lấy payment liên quan
          items: true, // nếu bạn dùng ProductSKUSnapshot làm items
        },
      })

      if (!order) {
        throw new NotFoundException('Không tìm thấy đơn hàng')
      }

      // 2. Kiểm tra trạng thái có cho phép hủy không
      if (
        order.status === ORDER_STATUS.DELIVERED ||
        order.status === ORDER_STATUS.RETURNED ||
        order.status === ORDER_STATUS.CANCELLED
      ) {
        throw new BadRequestException(
          order.status === ORDER_STATUS.CANCELLED
            ? 'Đơn hàng đã bị hủy trước đó'
            : 'Không thể hủy đơn hàng đã giao hoặc trả hàng',
        )
      }

      // 3. Cập nhật trạng thái order → CANCELLED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: ORDER_STATUS.CANCELLED,
          updatedById: userId,
        },
      })

      // 4. Cập nhật payment → FAILED (nếu payment vẫn đang PENDING)
      if (order.payment) {
        // Chỉ update nếu payment chưa thành công
        if (order.payment.status === PaymentStatus.PENDING) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: { status: PaymentStatus.FAILED },
          })
        }
        // Nếu payment đã SUCCESS thì thường không cho cancel, hoặc cần xử lý refund riêng
      }

      // 5. (Quan trọng) Hoàn lại stock nếu đã trừ kho
      // Giả sử bạn lưu quantity trong ProductSKUSnapshot (items)
      for (const item of order.items || []) {
        if (item.skuId && item.quantity > 0) {
          await tx.sKU.update({
            where: { id: item.skuId },
            data: {
              stock: {
                increment: item.quantity, // cộng lại số lượng đã trừ
              },
            },
          })
        }
      }
      return updatedOrder
    })
  }
}
