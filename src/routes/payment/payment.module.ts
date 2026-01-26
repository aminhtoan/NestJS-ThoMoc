import { Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { PaymentStatusRepository } from './payment.repo'
import { OrderModule } from '../order/order.module'

@Module({
  imports: [OrderModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentStatusRepository],
})
export class PaymentModule {}
