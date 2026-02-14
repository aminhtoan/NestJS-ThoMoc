import { forwardRef, Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderRepository } from './order.repo'
import { BullModule } from '@nestjs/bullmq'
import { PAYMENT_queue_name } from 'src/shared/constants/payment.constant'
import { OrderProducer } from './order.producer'
import { PaymentModule } from '../payment/payment.module'
import { DeliveryMethodModule } from '../delivery-method/delivery-method.module'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_queue_name,
    }),
    forwardRef(() => PaymentModule),
    DeliveryMethodModule,
  ],
  controllers: [OrderController],
  exports: [OrderProducer],
  providers: [OrderService, OrderRepository, OrderProducer],
})
export class OrderModule {}
