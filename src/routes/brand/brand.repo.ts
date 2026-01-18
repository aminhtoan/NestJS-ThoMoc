import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateBrandType,
  GetBrandDetailResType,
  GetBrandParamsType,
  GetBrandQueryResType,
  GetBrandQueryType,
  UpdateBrandType,
} from './brand.model'
import { Prisma } from '@prisma/client'
import { All_LANGUAGE_CODE } from 'src/shared/constants/other.constant'

@Injectable()
export class BrandRespository {
  constructor(private readonly prismaService: PrismaService) {}

  findById(params: GetBrandParamsType, languageId?: string): Promise<GetBrandDetailResType> {
    return this.prismaService.brand.findFirstOrThrow({
      where: {
        id: params.brandId,
        deletedAt: null,
      },
      include: {
        brandTranslations: {
          where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
    })
  }

  create(body: CreateBrandType, userId: number): Promise<GetBrandDetailResType> {
    const data = {
      ...body,
      createdById: userId,
    }

    return this.prismaService.brand.create({
      data,
      include: {
        brandTranslations: true,
      },
    })
  }

  update(body: UpdateBrandType, params: GetBrandParamsType, userId: number): Promise<GetBrandDetailResType> {
    return this.prismaService.brand.update({
      where: {
        id: params.brandId,
        deletedAt: null,
      },
      data: {
        ...body,
        updatedById: userId,
      },
      include: {
        brandTranslations: true,
      },
    })
  }

  async delete(userId: number, params: GetBrandParamsType, hard: boolean): Promise<GetBrandDetailResType> {
    return hard
      ? this.prismaService.brand.delete({
          where: {
            id: params.brandId,
            deletedAt: null,
          },
        })
      : this.prismaService.brand.update({
          where: {
            id: params.brandId,
            deletedAt: null,
          },
          data: {
            deletedById: userId,
            deletedAt: new Date(),
          },
        })
  }

  async list({ page, limit }: GetBrandQueryType, languageId?: string): Promise<GetBrandQueryResType> {
    const offset = (page - 1) * limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.brand.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.brand.findMany({
        where: {
          deletedAt: null,
        },
        skip: offset,
        take: limit,
        include: {
          brandTranslations: {
            where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])
    const totalPages = Math.ceil(totalItems / limit)

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages,
    }
  }
}
