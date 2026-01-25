import { Injectable } from '@nestjs/common'
import { PaymentStatusRepository } from './payment.repo'
import { WebhookPaymentType } from './payment.model'

@Injectable()
export class PaymentService {
  constructor(private readonly paymentStatusRepository: PaymentStatusRepository) {}

  async receiver(body: WebhookPaymentType) {
    return this.paymentStatusRepository.receiver(body)
  }
}
