import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateBrandTranslationType,
  GetBrandTranslationParamsType,
  GetBrandTranslationQueryType,
  UpdateBrandTranslationType,
} from './brand-translation.model'
import { BrandTranslationRespository } from './brand-translation.repo'
import { LanguagesService } from 'src/routes/languages/languages.service'
import { BrandService } from '../brand.service'
import { isRecordNotFoundError } from 'src/shared/helpers'

@Injectable()
export class BrandTranslationService {
  constructor(
    private readonly brandTranslationRespository: BrandTranslationRespository,
    private readonly languagesService: LanguagesService,
    @Inject(forwardRef(() => BrandService)) private readonly brandService: BrandService,
  ) {}

  async create(body: CreateBrandTranslationType, userId: number) {
    try {
      await this.languagesService.getLanguagesById(body.languageId)
      await this.brandService.findById({ brandId: body.brandId })
      return this.brandTranslationRespository.create(body, userId)
    } catch (error) {
      throw error
    }
  }

  async update(body: UpdateBrandTranslationType, params: GetBrandTranslationParamsType, userId: number) {
    try {
      if (body.languageId) await this.languagesService.getLanguagesById(body.languageId)
      if (body.brandId) await this.brandService.findById({ brandId: body.brandId })

      return await this.brandTranslationRespository.update(body, params, userId)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Brand Translation bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async delete(params: GetBrandTranslationParamsType, userId: number) {
    try {
      const hard = true
      return await this.brandTranslationRespository.delete(params, userId, hard)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Brand Translation bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async findById(params: GetBrandTranslationParamsType) {
    try {
      return await this.brandTranslationRespository.findById(params)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Brand Translation bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async list({ page, limit }: GetBrandTranslationQueryType) {
    return await this.brandTranslationRespository.list({ page, limit })
  }
}
