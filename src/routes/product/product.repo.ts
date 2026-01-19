import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  ProductType,
} from './product.model'
import { All_LANGUAGE_CODE } from 'src/shared/constants/other.constant'

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(query: GetProductsQueryType, languageId: string): Promise<GetProductsResType> {
    const { page, limit, name, brandIds, categories, minPrice, maxPrice } = query
    const skip = (page - 1) * limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.product.findMany({
        where: {
          deletedAt: null,
        },
        include: {
          productTranslations: {
            where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])
    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async findById(productId: number, languageId: string): Promise<GetProductDetailResType> {
    return await this.prismaService.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      include: {
        productTranslations: {
          where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
        skus: {
          where: { deletedAt: null },
        },
        brand: {
          include: {
            brandTranslations: {
              where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },

        categories: {
          where: { deletedAt: null },
          include: {
            categoryTranslations: {
              where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
            },
          },
        },
      },
    })
  }

  async delete(paramsId: number, deletedById: number, hard: boolean): Promise<ProductType> {
    return hard
      ? await Promise.all([
          this.prismaService.product.delete({
            where: { id: paramsId },
          }),
          this.prismaService.sKU.deleteMany({
            where: { productId: paramsId },
          }),
        ]).then(([product]) => product)
      : await Promise.all([
          this.prismaService.product.update({
            where: { id: paramsId, deletedAt: null },
            data: {
              deletedAt: new Date(),
              deletedById,
            },
          }),
          this.prismaService.sKU.updateMany({
            where: { productId: paramsId, deletedAt: null },
            data: {
              deletedAt: new Date(),
              deletedById,
            },
          }),
        ]).then(([product]) => product)
  }

  async create(data: CreateProductBodyType, createdById: number): Promise<GetProductDetailResType> {
    const { skus, categories, ...productData } = data
    return await this.prismaService.product.create({
      data: {
        ...productData,
        createdById,
        categories: {
          connect: categories.map((category) => ({ id: category })),
        },
        skus: {
          createMany: {
            data: skus,
          },
        },
      },
      include: {
        productTranslations: {
          where: { deletedAt: null },
        },
        brand: {
          include: {
            brandTranslations: {
              where: { deletedAt: null },
            },
          },
        },
        categories: {
          where: { deletedAt: null },
          include: {
            categoryTranslations: {
              where: { deletedAt: null },
            },
          },
        },
        skus: {
          where: { deletedAt: null },
        },
      },
    })
  }
}
