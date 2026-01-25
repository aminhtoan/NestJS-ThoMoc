import { Body, Controller, Post } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { WebhookPaymentDTO } from './payment.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('webhook')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  async handleWebhook(@Body() body: WebhookPaymentDTO) {
    return this.paymentService.receiver(body)
  }
}
