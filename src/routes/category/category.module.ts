import { Module } from '@nestjs/common'
import { CategoryService } from './category.service'
import { CategoryController } from './category.controller'
import { CategoryTranslationModule } from './category-translation/category-translation.module'
import { CategoryRespository } from './category.repo'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRespository],
  imports: [CategoryTranslationModule],
  exports: [CategoryService, CategoryRespository],
})
export class CategoryModule {}
