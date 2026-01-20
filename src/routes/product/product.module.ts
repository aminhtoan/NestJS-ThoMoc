import { Module } from '@nestjs/common'
import { ProductService } from './product.service'
import { ProductController } from './product.controller'
import { ProductTranslationModule } from './product-translation/product-translation.module'
import { ProductRepository } from './product.repo'
import { ManageProductService } from './manage-product.service'
import { ManageProductController } from './manage-product.controller'

@Module({
  controllers: [ProductController, ManageProductController],
  providers: [ProductService, ProductRepository, ManageProductService],
  imports: [ProductTranslationModule],
})
export class ProductModule {}
