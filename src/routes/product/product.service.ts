import { Injectable, NotFoundException } from '@nestjs/common'
import { ProductRepository } from './product.repo'
import { CreateProductBodyType, GetProductsQueryType } from './product.model'
import { I18n, I18nContext } from 'nestjs-i18n'
import { isRecordNotFoundError } from 'src/shared/helpers'

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async getProducts(query: GetProductsQueryType) {
    return await this.productRepository.list(query, I18nContext.current()?.lang)
  }

  async findById(id: number) {
    try {
      const product = await this.productRepository.findById(id, I18nContext.current()?.lang)
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

  async create(data: CreateProductBodyType, userId: number) {
    return await this.productRepository.create(data, userId)
  }

  async update(data: CreateProductBodyType, userId: number, id: number) {
    try {
      return await this.productRepository.update(data, userId, id)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Product bạn muốn cập nhật không tồn tại',
          },
        ])
      }
      throw error
    }
  }

  async delete(id: number, userId: number) {
    try {
      await this.productRepository.delete(id, userId, false)
      return {
        message: 'Xóa sản phẩm thành công',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Product bạn muốn xóa không tồn tại',
          },
        ])
      }
      throw error
    }
  }
}
