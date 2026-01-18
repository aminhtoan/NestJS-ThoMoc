import { Injectable, NotFoundException } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'
import { isRecordNotFoundError } from 'src/shared/helpers'
import { CategoryRespository } from './category.repo'
import { CreateCategoryBodyType, UpdateCategoryBodyType } from './category.model'

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRespository: CategoryRespository) {}

  findAll(parentCategoryId: number) {
    return this.categoryRespository.list({
      parentCategoryId: parentCategoryId,
      languageId: I18nContext.current()?.lang,
    })
  }

  async findById(categoryId: number) {
    try {
      return await this.categoryRespository.findById({ id: categoryId, languageId: I18nContext.current()?.lang })
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Category bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async create(body: CreateCategoryBodyType, createdById: number) {
    try {
      return this.categoryRespository.create(body, createdById)
    } catch (error) {
      throw error
    }
  }

  async update({ id, data, updatedById }: { id: number; data: UpdateCategoryBodyType; updatedById: number }) {
    try {
      return await this.categoryRespository.update(data, id, updatedById)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Category bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      return await this.categoryRespository.delete(deletedById, id, true)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Category bạn tìm không tồn tại',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }
}
