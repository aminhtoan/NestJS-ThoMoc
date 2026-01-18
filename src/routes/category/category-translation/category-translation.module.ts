import { forwardRef, Module } from '@nestjs/common'
import { CategoryTranslationService } from './category-translation.service'
import { CategoryTranslationController } from './category-translation.controller'
import { CategoryTranslationRespository } from './category-translation.repo'
import { LanguagesModule } from 'src/routes/languages/languages.module'
import { CategoryModule } from '../category.module'

@Module({
  imports: [LanguagesModule, forwardRef(() => CategoryModule)],
  controllers: [CategoryTranslationController],
  providers: [CategoryTranslationService, CategoryTranslationRespository],
})
export class CategoryTranslationModule {}
