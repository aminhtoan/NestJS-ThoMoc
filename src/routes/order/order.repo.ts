import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateOrderBodyType, CreateOrderResType, GetOrderListResType } from './order.model'
import { Order, PaymentStatus } from '@prisma/client'
import { ORDER_STATUS, OrderStatusType } from 'src/shared/constants/order.constant'

@Injectable()
export class OrderRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
      const allCartItemsId = body.flatMap((item) => item.cartItemIds)

      const cartItems = await tx.cartItem.findMany({
        where: {
          id: {
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

      // Kiểm tra xem kho còn đủ hàng tồn ko
      const isOutOfStock = cartItems.some((item) => {
        return item.sku.stock < item.quantity // stock < quantity mới là hết hàng
      })

      if (isOutOfStock) {
        throw new BadRequestException('Kho không đủ hàng tồn')
      }

      const hasInvalidProduct = cartItems.some((item) => {
        const p = item.sku.product
        return p.deletedAt !== null || p.publishedAt === null || (p.publishedAt && p.publishedAt > new Date())
      })
      if (hasInvalidProduct) {
        throw new BadRequestException('Sản phẩm đã bị xóa hoặc chưa được đăng')
      }

      // kiểm tra xem các skuid trong cartItem có thuộc về shop đó ko
      const cartItemMap = new Map(cartItems.map((item) => [item.id, item]))

      const createdOrders: Order[] = []

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
        body.map((item) =>
          tx.order.create({
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
              payment: {
                create: { status: PaymentStatus.PENDING },
              },
              items: {
                create: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)
                  return {
                    productName: cartItem.sku.product.name,
                    skuPrice: cartItem.sku.price,
                    image: cartItem.sku.image,
                    skuValue: cartItem.sku.value,
                    skuId: cartItem.skuId,
                    productId: cartItem.sku.product.id,
                    quantity: cartItem.quantity,
                    productTranslations: {
                      create: cartItem.sku.product.productTranslations.map((pt) => ({
                        name: pt.name,
                        description: pt.description,
                        languageId: pt.languageId,
                      })),
                    },
                  }
                }),
              },
              products: {
                connect: item.cartItemIds.map((cartItemId) => {
                  const cartItem = cartItemMap.get(cartItemId)
                  return { id: cartItem.sku.product.id }
                }),
              },
            },
          }),
        ),
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

  // async create2(userId: number, body: CreateOrderBodyType): Promise<CreateOrderResType> {
  //   return await this.prismaService.$transaction(async (tx) => {
  //     const allCartItemsId = body.flatMap((item) => item.cartItemIds)

  //     const cartItems = await tx.cartItem.findMany({
  //       where: {
  //         id: { in: allCartItemsId },
  //         userId,
  //       },
  //       include: {
  //         sku: {
  //           include: {
  //             product: {
  //               include: {
  //                 productTranslations: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     })

  //     // 1. Kiểm tra cart items
  //     if (cartItems.length !== allCartItemsId.length) {
  //       throw new BadRequestException('Không tìm thấy sản phẩm trong giỏ hàng')
  //     }

  //     // 2. Kiểm tra stock - FIXED LOGIC
  //     const outOfStockItems = cartItems.filter((item) => item.sku.stock < item.quantity)
  //     if (outOfStockItems.length > 0) {
  //       throw new BadRequestException('Kho không đủ hàng tồn')
  //     }

  //     // 3. Kiểm tra product validity
  //     const hasInvalidProduct = cartItems.some((item) => {
  //       const p = item.sku.product
  //       return p.deletedAt !== null || p.publishedAt === null || (p.publishedAt && p.publishedAt > new Date())
  //     })
  //     if (hasInvalidProduct) {
  //       throw new BadRequestException('Sản phẩm đã bị xóa hoặc chưa được đăng')
  //     }

  //     const cartItemMap = new Map(cartItems.map((item) => [item.id, item]))

  //     // 4. Kiểm tra theo từng shop và update stock
  //     for (const group of body) {
  //       const groupItems = group.cartItemIds.map((id) => cartItemMap.get(id)).filter(Boolean)

  //       if (groupItems.length !== group.cartItemIds.length) {
  //         throw new BadRequestException('Không tìm thấy sản phẩm trong giỏ hàng của shop này')
  //       }

  //       // Check shop ownership
  //       const shopIds = new Set(groupItems.map((item) => item.sku.product.createdById))
  //       if (shopIds.size !== 1 || !shopIds.has(group.shopId)) {
  //         throw new BadRequestException('Một số sản phẩm không thuộc shop này')
  //       }

  //       // Update stock
  //       for (const item of groupItems) {
  //         await tx.sKU.update({
  //           where: { id: item.skuId },
  //           data: { stock: { decrement: item.quantity } },
  //         })
  //       }
  //     }

  //     // 5. Tạo order - FIX cách viết data
  //     const orders = await Promise.all(
  //       body.map(async (group) => {
  //         const groupItems = group.cartItemIds.map((id) => cartItemMap.get(id)).filter(Boolean)

  //         // Tạo snapshots cho từng order
  //         const orderItemSnapshots = groupItems.map((item) => ({
  //           productName: item.sku.product.name,
  //           skuPrice: item.sku.price,
  //           image: item.sku.image,
  //           skuValue: item.sku.value,
  //           skuId: item.skuId,
  //           productId: item.sku.product.id,
  //           quantity: item.quantity,
  //           // CHỈ LƯU productTranslations nếu schema cho phép
  //           // Nếu không, có thể lưu dưới dạng JSON
  //           productTranslations: item.sku.product.productTranslations,
  //         }))

  //         // Tạo order - TRƯỚC HẾT thử cách đơn giản
  //         const orderData: any = {
  //           userId, // Thử dùng trực tiếp
  //           shopId: group.shopId, // Thử dùng trực tiếp
  //           status: ORDER_STATUS.PENDING_PAYMENT,
  //           receiver: group.receiver,
  //         }

  //         // Thêm payment
  //         orderData.payment = {
  //           create: { status: PaymentStatus.PENDING },
  //         }

  //         // Thêm items
  //         orderData.items = {
  //           create: orderItemSnapshots.map((snapshot) => ({
  //             productName: snapshot.productName,
  //             skuPrice: snapshot.skuPrice,
  //             image: snapshot.image,
  //             skuValue: snapshot.skuValue,
  //             skuId: snapshot.skuId,
  //             productId: snapshot.productId,
  //             quantity: snapshot.quantity,
  //             // Nếu có field productTranslations trong OrderItem
  //             productTranslations: snapshot.productTranslations
  //               ? {
  //                   create: snapshot.productTranslations.map((pt) => ({
  //                     name: pt.name,
  //                     description: pt.description,
  //                     languageId: pt.languageId,
  //                   })),
  //                 }
  //               : undefined,
  //           })),
  //         }

  //         // Thêm products connection
  //         orderData.products = {
  //           connect: groupItems.map((item) => ({
  //             id: item.sku.product.id,
  //           })),
  //         }

  //         return await tx.order.create({
  //           data: orderData,
  //           include: {
  //             items: true,
  //             payment: true,
  //           },
  //         })
  //       }),
  //     )

  //     // 6. Xóa cart items sau khi tạo order thành công
  //     await tx.cartItem.deleteMany({
  //       where: {
  //         id: { in: allCartItemsId },
  //         userId,
  //       },
  //     })

  //     return orders
  //   })
  // }
}
