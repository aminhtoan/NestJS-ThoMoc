import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateCategoryTranslationBodyType,
  GetCategoryTranslationDetailResType,
  UpdateCategoryTranslationBodyType,
} from './category-translation.model'
import { CategoryType } from '../category.model'

@Injectable()
export class CategoryTranslationRespository {
  constructor(private readonly prismaService: PrismaService) {}

  create(body: CreateCategoryTranslationBodyType, createdById: number): Promise<GetCategoryTranslationDetailResType> {
    return this.prismaService.categoryTranslation.create({
      data: {
        ...body,
        createdById,
      },
    })
  }

  update(
    body: UpdateCategoryTranslationBodyType,
    updatedById: number,
    id: number,
  ): Promise<GetCategoryTranslationDetailResType> {
    return this.prismaService.categoryTranslation.update({
      where: {
        id,
      },
      data: {
        ...body,
        updatedById,
      },
    })
  }

  delete(id: number, deletedById: number, hard: boolean): Promise<CategoryType> {
    return hard
      ? this.prismaService.categoryTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.categoryTranslation.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedById,
            deletedAt: new Date(),
          },
        })
  }

  async findById(id: number): Promise<GetCategoryTranslationDetailResType> {
    return this.prismaService.categoryTranslation.findFirstOrThrow({
      where: {
        id,
        deletedAt: null,
      },
    })
  }
}
