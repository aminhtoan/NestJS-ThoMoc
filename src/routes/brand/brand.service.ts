import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateBrandType, GetBrandParamsType, GetBrandQueryType, UpdateBrandType } from './brand.model'
import { BrandRespository } from './brand.repo'
import { isRecordNotFoundError } from 'src/shared/helpers'

@Injectable()
export class BrandService {
  constructor(private readonly brandRespository: BrandRespository) {}
  async create(body: CreateBrandType, userId: number) {
    try {
      return this.brandRespository.create(body, userId)
    } catch (error) {
      throw error
    }
  }

  async update(params: GetBrandParamsType, body: UpdateBrandType, userId: number) {
    try {
      return this.brandRespository.update(body, params, userId)
    } catch (error) {
      throw error
    }
  }

  async delete(userId: number, params: GetBrandParamsType) {
    try {
      const hard = true
      await this.brandRespository.delete(userId, params, hard)
      return {
        message: 'Xóa Brand thành công',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Brand bạn xóa không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async findById(params: GetBrandParamsType) {
    try {
      return await this.brandRespository.findById(params)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Brand bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async list({ page, limit }: GetBrandQueryType) {
    return this.brandRespository.list({ page, limit })
  }
}
