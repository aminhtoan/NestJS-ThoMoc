import { Module } from '@nestjs/common'
import { BrandService } from './brand.service'
import { BrandController } from './brand.controller'
import { BrandTranslationModule } from './brand-translation/brand-translation.module'
import { BrandRespository } from './brand.repo'

@Module({
  controllers: [BrandController],
  providers: [BrandService, BrandRespository],
  imports: [BrandTranslationModule],
  exports: [BrandService, BrandRespository],
})
export class BrandModule {}
