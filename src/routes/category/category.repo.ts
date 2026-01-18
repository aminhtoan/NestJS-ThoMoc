import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

import { All_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import {
  CategoryType,
  CategoryWithTranslationsType,
  CreateCategoryBodyType,
  GetAllCategoriesResponseType,
  GetCategoryDetailResponseType,
  UpdateCategoryBodyType,
} from './category.model'

@Injectable()
export class CategoryRespository {
  constructor(private readonly prismaService: PrismaService) {}

  findById({ id, languageId }: { id: number; languageId: string }): Promise<GetCategoryDetailResponseType> {
    return this.prismaService.category.findFirstOrThrow({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        categoryTranslations: {
          where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
    })
  }

  async list({
    parentCategoryId,
    languageId,
  }: {
    parentCategoryId?: number
    languageId: string
  }): Promise<GetAllCategoriesResponseType> {
    const category = await this.prismaService.category.findMany({
      where: {
        deletedAt: null,
        parentCategoryId: parentCategoryId ?? null,
      },
      include: {
        categoryTranslations: {
          where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      data: category,
      totalItems: category.length,
    }
  }

  create(body: CreateCategoryBodyType, createdById: number): Promise<GetCategoryDetailResponseType> {
    return this.prismaService.category.create({
      data: { ...body, createdById },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  update(body: UpdateCategoryBodyType, id: number, updatedById: number): Promise<GetCategoryDetailResponseType> {
    return this.prismaService.category.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...body,
        updatedById,
      },
      include: {
        categoryTranslations: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  async delete(deletedById: number, id: number, hard: boolean): Promise<CategoryType> {
    return hard
      ? this.prismaService.brand.delete({
          where: {
            id,
          },
        })
      : this.prismaService.brand.update({
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
}
