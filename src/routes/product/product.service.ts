import { Injectable, NotFoundException } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { isRecordNotFoundError } from 'src/shared/helpers'
import { GetProductsQueryType } from './product.model'
import { ProductRepository } from './product.repo'

// Chỉ dành phục vị cho client và guess
@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async list(props: { query: GetProductsQueryType }) {
    const data = await this.productRepository.list({
      page: props.query.page,
      limit: props.query.limit,
      createdById: props.query.createdById,
      languageId: I18nContext.current()?.lang as string,
      brandIds: props.query.brandIds,
      categories: props.query.categories,
      name: props.query.name,
      minPrice: props.query.minPrice,
      maxPrice: props.query.maxPrice,
      orderBy: props.query.orderBy,
      sortBy: props.query.sortBy,
    })
    return data
  }

  async getDetail(props: { productId: number }) {
    try {
      const product = await this.productRepository.getDetail({
        productId: props.productId,
        languageId: I18nContext.current()?.lang as string,
        isPublic: true,
      })
      return product
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Product bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }
}
