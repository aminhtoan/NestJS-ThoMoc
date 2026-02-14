import { createZodDto } from 'nestjs-zod'
import {
  PaymentTransactionSchema,
  WebhookPaymentSchema,
  PaymentMethodSchema,
  CreatePaymentMethodSchema,
  UpdatePaymentMethodSchema,
} from './payment.model'

export class PaymentMethodDTO extends createZodDto(PaymentMethodSchema) {}
export class CreatePaymentMethodDTO extends createZodDto(CreatePaymentMethodSchema) {}
export class UpdatePaymentMethodDTO extends createZodDto(UpdatePaymentMethodSchema) {}
export class PaymentTransactionDTO extends createZodDto(PaymentTransactionSchema) {}
export class WebhookPaymentDTO extends createZodDto(WebhookPaymentSchema) {}
