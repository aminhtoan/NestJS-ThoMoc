import { Injectable, NotFoundException } from '@nestjs/common'
import { ProductTranslationRepository } from './repo-translation.repo'
import { CreateProductTranslationBodyType, UpdateProductTranslationBodyType } from './product-translation.model'
import { isForeignKeyConstraintError, isRecordNotFoundError } from 'src/shared/helpers' // Helper từ project cũ của bạn

@Injectable()
export class ProductTranslationService {
  constructor(private readonly productTranslationRepository: ProductTranslationRepository) {}

  async create(data: CreateProductTranslationBodyType, userId: number) {
    try {
      return await this.productTranslationRepository.create(data, userId)
    } catch (error) {
      if (isForeignKeyConstraintError(error)) {
        throw new NotFoundException([
          {
            message: 'Sản phẩm không tồn tại',
            path: 'productId',
          },
        ])
      }
    }
  }

  async findById(id: number) {
    const translation = await this.productTranslationRepository.findById(id)
    if (!translation) {
      throw new NotFoundException([
        {
          message: 'Bản dịch không tồn tại',
          path: 'id',
        },
      ])
    }
    return translation
  }

  async update(id: number, data: UpdateProductTranslationBodyType, userId: number) {
    try {
      return await this.productTranslationRepository.update(id, data, userId)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Bản dịch bạn muốn cập nhật không tồn tại',
            path: 'productTranslationId',
          },
        ])
      }
      throw error
    }
  }

  async delete(id: number, userId: number) {
    try {
      await this.productTranslationRepository.delete(id, userId)
      return {
        message: 'Xóa bản dịch thành công',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Bản dịch bạn muốn xóa không tồn tại',
            path: 'productTranslationId',
          },
        ])
      }
      throw error
    }
  }
}
