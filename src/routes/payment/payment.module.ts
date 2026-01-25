import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { PaymentStatusRepository } from './payment.repo'

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PaymentStatusRepository],
})
export class PaymentModule {}
