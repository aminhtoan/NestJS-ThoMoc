import { BadRequestException, Injectable } from '@nestjs/common'

import { parse } from 'date-fns'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import { PAYMENT_CODE, PaymentStatus } from 'src/shared/constants/payment.constant'
import { MessageType } from 'src/shared/models/response.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { WebhookPaymentType } from './payment.model'
import { Prisma } from '@prisma/client'
import { isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { OrderProducer } from '../order/order.producer'

@Injectable()
export class PaymentStatusRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async receiver(body: WebhookPaymentType): Promise<{ userId?: number; paymentId?: number; message: string }> {
    let amount_in = 0
    let amount_out = 0

    if (body.transferType === 'in') {
      amount_in = body.transferAmount
    } else if (body.transferType === 'out') {
      amount_out = body.transferAmount
    }

    // kiểm tra description và số tiền có khớp với nhau không, nếu có thì cập nhật trạng thái đơn hàng tương ứng
    const contentToCheck = body.code || body.content || ''
    // Regex: Tìm chuỗi PAYMENT_CODE (vd TJOXO), bỏ qua khoảng trắng (\s*), lấy dãy số (\d+)
    const regex = new RegExp(`${PAYMENT_CODE}\\s*(\\d+)`, 'i')
    const match = contentToCheck.match(regex)
    const paymentId = match ? Number(match[1]) : NaN
    if (isNaN(paymentId)) {
      throw new BadRequestException('Không tìm thấy đơn hàng từ mã giao dịch')
    }

    const payment = await this.prismaService.payment.findUnique({
      where: { id: paymentId },
      include: {
        orders: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!payment) {
      throw new BadRequestException(`Không tìm thấy đơn hàng từ mã giao dịch ${paymentId}`)
    }

    if (payment.status === PaymentStatus.SUCCESS) {
      return { message: 'Đơn hàng đã được thanh toán trước đó' }
    }

    // Tính tổng số tiền của tất cả các đơn hàng liên quan đến thanh toán này
    const totalOrderAmount = payment.orders.reduce((total, order) => {
      // Tính tổng tiền của từng đơn hàng
      const orderTotal = order.items.reduce((itemTotal, item) => itemTotal + item.skuPrice * item.quantity, 0)
      return total + orderTotal
    }, 0)

    if (amount_in < totalOrderAmount) {
      // Case: Khách chuyển thiếu 1000đ hoặc phí ngân hàng trừ bớt.
      // KHÔNG THROW ERROR -> Để tránh gateway retry.
      // Có thể update status là 'FAILED' hoặc 'PARTIAL' tùy business.
      console.warn(`[Payment Warning] ID ${paymentId}: Nhận ${amount_in}, cần ${totalOrderAmount}`)
      return { message: 'Số tiền giao dịch không đủ. Vui lòng liên hệ CSKH.' }
    }

    await this.prismaService.$transaction(async (tx) => {
      try {
        await tx.paymentTransaction.create({
          data: {
            id: body.id,
            gateway: body.gateway,
            transactionDate: parse(body.transactionDate, 'yyyy-MM-dd HH:mm:ss', new Date()),
            accountNumber: body.accountNumber,
            subAccount: body.subAccount,
            amountIn: amount_in,
            amountOut: amount_out,
            accumulated: body.accumulated,
            code: body.code,
            transactionContent: body.content,
            referenceNumber: body.referenceCode,
            body: body.description,
          },
        })
      } catch (e) {
        if (isUniqueConstraintError(e)) {
          return
        }
        throw e
      }

      await tx.payment.updateMany({
        where: { id: payment.id, status: { not: PaymentStatus.SUCCESS } },
        data: { status: PaymentStatus.SUCCESS },
      })

      await tx.order.updateMany({
        where: {
          id: {
            in: payment.orders.map((o) => o.id),
          },
        },
        data: { status: ORDER_STATUS.PENDING_PICKUP },
      })
    })
    const buyerId = payment.orders[0]?.userId
    return {
      userId: buyerId,
      paymentId,
      message: 'Thanh toán thành công',
    }
  }
}
