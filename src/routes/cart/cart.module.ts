import { CartRepository } from './cart.repo'
import { Module } from '@nestjs/common'
import { CartService } from './cart.service'
import { CartController } from './cart.controller'

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
