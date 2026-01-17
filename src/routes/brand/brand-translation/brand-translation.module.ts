import { BrandModule } from './../brand.module'
import { forwardRef, Module } from '@nestjs/common'
import { BrandTranslationService } from './brand-translation.service'
import { BrandTranslationController } from './brand-translation.controller'
import { BrandTranslationRespository } from './brand-translation.repo'
import { LanguagesModule } from 'src/routes/languages/languages.module'

@Module({
  imports: [LanguagesModule, forwardRef(() => BrandModule)],
  controllers: [BrandTranslationController],
  providers: [BrandTranslationService, BrandTranslationRespository],
})
export class BrandTranslationModule {}
