import { Module } from '@nestjs/common'
import { DeliveryMethodController } from './delivery-method.controller'
import { DeliveryMethodService } from './delivery-method.service'
import { DeliveryMethodRepository } from './delivery-method.repo'

@Module({
  controllers: [DeliveryMethodController],
  providers: [DeliveryMethodService, DeliveryMethodRepository],
  exports: [DeliveryMethodService, DeliveryMethodRepository],
})
export class DeliveryMethodModule {}
