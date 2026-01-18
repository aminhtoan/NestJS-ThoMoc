import { Injectable, NotFoundException } from '@nestjs/common'
import { CategoryTranslationRespository } from './category-translation.repo'
import { CreateCategoryTranslationBodyType, UpdateCategoryTranslationBodyType } from './category-translation.model'
import { LanguagesService } from 'src/routes/languages/languages.service'
import { CategoryService } from '../category.service'
import { isRecordNotFoundError } from 'src/shared/helpers'

@Injectable()
export class CategoryTranslationService {
  constructor(
    private readonly categoryTranslationRespository: CategoryTranslationRespository,
    private readonly languagesService: LanguagesService,
    private readonly categoryService: CategoryService,
  ) {}

  async create(body: CreateCategoryTranslationBodyType, userId: number) {
    try {
      if (body.languageId) await this.languagesService.getLanguagesById(body.languageId)
      if (body.categoryId) await this.categoryService.findById(body.categoryId)
      return await this.categoryTranslationRespository.create(body, userId)
    } catch (error) {
      throw error
    }
  }

  async update(body: UpdateCategoryTranslationBodyType, userId: number, categoryTranslationId: number) {
    try {
      if (body.languageId) await this.languagesService.getLanguagesById(body.languageId)
      if (body.categoryId) await this.categoryService.findById(body.categoryId)
      return this.categoryTranslationRespository.update(body, userId, categoryTranslationId)
    } catch (error) {
      throw error
    }
  }

  async delete(userId: number, categoryTranslationId: number) {
    try {
      return await this.categoryTranslationRespository.delete(categoryTranslationId, userId, true)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Category Translation bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async findById(id: number) {
    try {
      return await this.categoryTranslationRespository.findById(id)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Category Translation bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }
}
