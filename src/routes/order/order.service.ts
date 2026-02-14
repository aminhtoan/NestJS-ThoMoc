import { Injectable } from '@nestjs/common'
import { PaymentService } from '../payment/payment.service'
import { CreateOrderBodyType, GetOrderQueryType } from './order.model'
import { OrderProducer } from './order.producer'
import { OrderRepository } from './order.repo'

@Injectable()
export class OrderService {
  constructor(
    private readonly OrderRepository: OrderRepository,
    private readonly orderProducer: OrderProducer,
    private readonly paymentService: PaymentService,
  ) {}
  async list(userId: number, query: GetOrderQueryType) {
    const res = await this.OrderRepository.list({ userId: userId, ...query })
    return res
  }

  async create(userId: number, body: CreateOrderBodyType) {
    const orders = await this.OrderRepository.create(userId, body)
    await Promise.all(
      orders.data
        .filter((o) => o.paymentId)
        .map((o) =>
          this.orderProducer.removeCancelPaymentJob(o.paymentId.toString()).catch((err) => {
            console.error(`Failed to add cancel-payment job, paymentId=${o.paymentId}`, err)
          }),
        ),
    )

    return orders
  }

  async getDetail(userId: number, orderId: number) {
    const res = await this.OrderRepository.findDetailOrder(userId, orderId)

    return res
  }

  async cancelOrder(userId: number, orderId: number) {
    const res = await this.OrderRepository.cancelOrder(userId, orderId)
    return res
  }

  // async getPaymentQR(userId: number, params: GetOrderParamsType) {
  //   const order = await this.OrderRepository.findDetailOrder(userId, params.orderId)

  //   // Lấy payment details
  //   const payment = await this.paymentService.getPaymentWithDetails(order.shopId)

  //   if (!payment) {
  //     throw new BadRequestException('Không tìm thấy thông tin thanh toán')
  //   }

  //   if (!payment.paymentMethod) {
  //     throw new BadRequestException('Không tìm thấy phương thức thanh toán')
  //   }

  //   // Chỉ tạo QR cho bank transfer
  //   if (payment.paymentMethod.code !== PaymentMethodCode.BANK_TRANSFER) {
  //     throw new BadRequestException('QR Code chỉ áp dụng cho chuyển khoản ngân hàng')
  //   }

  //   const qrUrl = await this.paymentService.getQRForBankTransfer(payment.amount, payment.id)

  //   return {
  //     orderId: params.orderId,
  //     paymentId: payment.id,
  //     amount: payment.amount,
  //     paymentMethod: payment.paymentMethod.name,
  //     qrUrl,
  //     bankInfo: {
  //       accountNumber: '0932682977',
  //       bankName: 'MBBank',
  //       accountName: 'Your Account Name',
  //     },
  //     description: `${PAYMENT_CODE}${payment.id}`,
  //   }
  // }
}
