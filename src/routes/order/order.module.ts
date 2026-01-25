import { Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { OrderRepository } from './order.repo'
import { BullModule } from '@nestjs/bullmq'
import { PAYMENT_queue_name } from 'src/shared/constants/payment.constant'
import { OrderProducer } from './order.producer'
import { RedisConfigService } from 'src/shared/services/redis-config.service'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_queue_name,
    }),
  ],
  controllers: [OrderController],

  providers: [OrderService, OrderRepository, OrderProducer, RedisConfigService],
})
export class OrderModule {}
