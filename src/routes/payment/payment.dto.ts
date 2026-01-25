import { createZodDto } from 'nestjs-zod'
import { PaymentTransactionSchema, WebhookPaymentSchema } from './payment.model'

export class PaymentTransactionDTO extends createZodDto(PaymentTransactionSchema) {}
export class WebhookPaymentDTO extends createZodDto(WebhookPaymentSchema) {}
