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
}
