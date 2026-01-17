import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  BrandTranslationType,
  CreateBrandTranslationType,
  GetBrandTranslationDetailResType,
  GetBrandTranslationParamsType,
  GetBrandTranslationQueryType,
  ResponeBrandTranslationType,
  UpdateBrandTranslationType
} from './brand-translation.model'

@Injectable()
export class BrandTranslationRespository {
  constructor(private readonly prismaService: PrismaService) {}

  create(body: CreateBrandTranslationType, userId: number): Promise<ResponeBrandTranslationType> {
    return this.prismaService.brandTranslation.create({
      data: {
        ...body,
        createdById: userId,
      },
    })
  }

  update(
    body: UpdateBrandTranslationType,
    parms: GetBrandTranslationParamsType,
    userId: number,
  ): Promise<BrandTranslationType> {
    return this.prismaService.brandTranslation.update({
      where: {
        id: parms.brandTranslationId,
      },
      data: {
        ...body,
        updatedById: userId,
      },
    })
  }

  delete(parms: GetBrandTranslationParamsType, userId: number, hard: boolean): Promise<ResponeBrandTranslationType> {
    return hard
      ? this.prismaService.brandTranslation.delete({
          where: {
            id: parms.brandTranslationId,
            deletedAt: null,
          },
        })
      : this.prismaService.brandTranslation.update({
          where: {
            id: parms.brandTranslationId,
          },
          data: {
            deletedById: userId,
            deletedAt: new Date(),
          },
        })
  }

  findById(parms: GetBrandTranslationParamsType): Promise<ResponeBrandTranslationType> {
    return this.prismaService.brandTranslation.findFirst({
      where: {
        id: parms.brandTranslationId,
        deletedAt: null,
      },
    })
  }

  async list({ page, limit }: GetBrandTranslationQueryType): Promise<GetBrandTranslationDetailResType> {
    const offset = (page - 1) * limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.brandTranslation.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.brandTranslation.findMany({
        where: {
          deletedAt: null,
        },
        skip: offset,
        take: limit,
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
