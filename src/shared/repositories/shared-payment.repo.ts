import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ORDER_STATUS } from '../constants/order.constant'
import { PaymentStatus } from '../constants/payment.constant'

@Injectable()
export class SharedPaymentRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async celcelPaymentWithOrder(paymentId: number) {
   const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        status: true,
        orders: {
          where: { deletedAt: null },
          select: {
            id: true,
            status: true,
            items: {
              select: { skuId: true, quantity: true }
            }
          }
        }
      }
    })

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }

    // Nếu không có orders thì không cần xử lý
    if (!payment.orders || payment.orders.length === 0) {
      return []
    }

    // Group SKU theo id và tính tổng quantity để tránh update nhiều lần
    const skuQuantityMap = new Map<number, number>()
    payment.orders.forEach((order) => {
      order.items
        .filter((item) => item.skuId && item.quantity > 0)
        .forEach((item) => {
          const currentQty = skuQuantityMap.get(item.skuId!) || 0
          skuQuantityMap.set(item.skuId!, currentQty + item.quantity)
        })
    })

    const data = await this.prismaService.$transaction([
      this.prismaService.payment.update({
        where: {
          id: paymentId,
          status: PaymentStatus.PENDING,
        },
        data: {
          status: PaymentStatus.FAILED,
        },
      }),

      this.prismaService.order.updateMany({
        where: {
          id: {
            in: payment.orders.map((order) => order.id),
          },
          status: ORDER_STATUS.PENDING_PAYMENT,
          deletedAt: null,
        },
        data: {
          status: ORDER_STATUS.CANCELLED,
          deletedAt: new Date(),
        },
      }),

      // Hoàn lại stock cho từng SKU (đã group để tránh update trùng lặp)
      ...Array.from(skuQuantityMap.entries()).map(([skuId, totalQuantity]) =>
        this.prismaService.sKU.update({
          where: {
            id: skuId,
            deletedAt: null,
          },
          data: {
            stock: {
              increment: totalQuantity,
            },
          },
        }),
      ),
    ])

    return data
  }
}
