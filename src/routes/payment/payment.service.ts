import { Injectable } from '@nestjs/common'
import { PaymentStatusRepository } from './payment.repo'
import { WebhookPaymentType } from './payment.model'
import { OrderProducer } from '../order/order.producer'

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentStatusRepository: PaymentStatusRepository,
    private orderProducer: OrderProducer,
  ) {}

  async receiver(body: WebhookPaymentType) {
    const data = await this.paymentStatusRepository.receiver(body)

    if (!data.paymentId) {
      return {
        message: data.message,
      }
    }

    try {
      await this.orderProducer.removeCancelPaymentJob(data.paymentId.toString())
    } catch (err) {
      console.error(`Failed to remove cancel-payment job, paymentId=${data.paymentId}`, err)
    }

    return {
      message: data.message,
    }
  }

  async createQR(amount: number, description: string) {
    //description ờ đây là gì? là mã payment code và số paymentId, TJOXO + 12 => TJOXO12
    const qr = `https://qr.sepay.vn/img?acc=0932682977&bank=MBBank&amount=${amount}&des=${description}`
    return qr
  }
}
