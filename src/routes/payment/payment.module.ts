import { forwardRef, Module } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { PaymentController } from './payment.controller'
import { PaymentStatusRepository } from './payment.repo'
import { PaymentMethodController } from './paymentMethod.controller'
import { PaymentMethodService } from './paymentMethod.service'
import { PaymentMethodRepository } from './paymentMethod.repo'
import { OrderModule } from '../order/order.module'

@Module({
  imports: [forwardRef(() => OrderModule)],
  controllers: [PaymentController, PaymentMethodController],
  providers: [PaymentService, PaymentStatusRepository, PaymentMethodService, PaymentMethodRepository],
  exports: [PaymentMethodService, PaymentMethodRepository, PaymentService],
})
export class PaymentModule {}
