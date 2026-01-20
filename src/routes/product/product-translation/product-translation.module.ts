import { Module } from '@nestjs/common'
import { ProductTranslationService } from './product-translation.service'
import { ProductTranslationController } from './product-translation.controller'
import { ProductTranslationRepository } from './repo-translation.repo'

@Module({
  controllers: [ProductTranslationController],
  providers: [ProductTranslationService, ProductTranslationRepository],
})
export class ProductTranslationModule {}
