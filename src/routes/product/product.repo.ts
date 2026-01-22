import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { All_LANGUAGE_CODE, OrderByType, SortBy, SortByType } from 'src/shared/constants/other.constant'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
} from './product.model'

@Injectable()
export class ProductRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list({
    page,
    limit,
    name,
    brandIds,
    categories,
    minPrice,
    maxPrice,
    createdById,
    isPublic,
    languageId,
    orderBy,
    sortBy,
  }: {
    page: number
    limit: number
    name?: string
    brandIds?: number[]
    categories?: number[]
    minPrice?: number
    maxPrice?: number
    createdById?: number
    isPublic?: boolean
    languageId: string
    orderBy: OrderByType
    sortBy: SortByType
  }): Promise<GetProductsResType> {
    const skip = (page - 1) * limit
    let where: Prisma.ProductWhereInput = {
      deletedAt: null,
      createdById: createdById ? createdById : undefined,
      brandId: brandIds && brandIds.length > 0 ? { in: brandIds } : undefined,
      categories: categories && categories.length > 0 ? { some: { id: { in: categories } } } : undefined,
      name: name ? { contains: name, mode: 'insensitive' } : undefined,
      basePrice:
        minPrice || maxPrice
          ? {
              ...(minPrice ? { gte: minPrice } : {}),
              ...(maxPrice ? { lte: maxPrice } : {}),
            }
          : undefined,
    }

    let caculatedOrderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {
      createdAt: orderBy,
    }
    if (sortBy === SortBy.Price) {
      caculatedOrderBy = { basePrice: orderBy }
    } else if (sortBy === SortBy.Sale) {
      caculatedOrderBy = {
        orders: {
          _count: orderBy,
        },
      }
    }

    if (isPublic === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublic === false) {
      where = {
        ...where,
        OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
      }
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.product.count({
        where,
      }),
      this.prismaService.product.findMany({
        where,
        include: {
          productTranslations: {
            where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
          orders: {
            where: {
              deletedAt: null,
              status: 'DELIVERED',
            },
          },
        },
        orderBy: caculatedOrderBy,
        skip,
        take: limit,
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

  async getDetail({
    productId,
    languageId,
    isPublic,
  }: {
    productId: number
    languageId: string
    isPublic?: boolean
  }): Promise<GetProductDetailResType> {
    let where: Prisma.ProductWhereInput = {
      id: productId,
      deletedAt: null,
    }

    if (isPublic === true) {
      where.publishedAt = {
        lte: new Date(),
        not: null,
      }
    } else if (isPublic === false) {
      where = {
        OR: [
          { ...where, publishedAt: null },
          { ...where, publishedAt: { gt: new Date() } },
        ],
      }
    }
    return await this.prismaService.product.findFirstOrThrow({
      where,
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

  async findById({ productId }: { productId: number }): Promise<ProductType> {
    return await this.prismaService.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
    })
  }

  async delete(paramsId: number, deletedById: number, hard?: boolean): Promise<ProductType> {
    return hard
      ? await this.prismaService.product.delete({
          where: { id: paramsId },
        })
      : await Promise.all([
          this.prismaService.product.update({
            where: { id: paramsId, deletedAt: null },
            data: {
              deletedAt: new Date(),
              deletedById,
            },
          }),

          this.prismaService.productTranslation.updateMany({
            where: { productId: paramsId, deletedAt: null },
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
            data: skus.map((sku) => ({
              ...sku,
              createdById,
            })),
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

  async update(body: UpdateProductBodyType, updatedById: number, paramId: number): Promise<ProductType> {
    const { skus: dataSkus, categories, ...productData } = body

    // lấy danh sách sku hiện tại từ DB
    const existingSKU = await this.prismaService.sKU.findMany({
      where: { productId: paramId, deletedAt: null },
    })

    // tìm các sku tồn tại trong DB nhưng không có trong data payload thì sẽ bị xóa
    const skusToDelete = existingSKU.filter((sku) => dataSkus.every((dataSku) => dataSku.value !== sku.value))
    const skuIdToDelete = skusToDelete.map((sku) => sku.id)

    // mapping id vào data payload để phân biệt giữa cập nhật và thêm mới
    const skusWithId = dataSkus.map((dataSku) => {
      const existing = existingSKU.find((sku) => sku.value === dataSku.value)
      return { ...dataSku, id: existing ? existing.id : null }
    })
    // tìm sku cần để cập nhật
    const skusToUpdate = skusWithId.filter((sku) => sku.id !== null)

    // tìm sku cần để tạo mới
    const skusToCreate = skusWithId
      .filter((sku) => sku.id === null)
      .map((sku) => {
        // loại bỏ trường id vì không cần thiết khi tạo mới
        const { id: skuId, ...rest } = sku
        return { ...rest, productId: paramId }
      })

    // thực hiện transaction cập nhật product, xóa sku, cập nhật sku, tạo mới sku
    // đảm bảo tất cả các thao tác đều thành công hoặc không có thao tác nào được thực hiện
    const [product] = await this.prismaService.$transaction([
      // Update thông tin Product
      this.prismaService.product.update({
        where: { id: paramId, deletedAt: null },
        data: {
          ...productData, // Update tên, giá gốc, ảnh...
          updatedById,
          categories: {
            set: categories.map((id) => ({ id })), // Update categories
          },
        },
      }),

      // Xóa SKU cũ soft delete
      this.prismaService.sKU.updateMany({
        where: { id: { in: skuIdToDelete } },
        data: {
          deletedAt: new Date(),
          deletedById: updatedById,
        },
      }),

      // Update SKU hiện có
      ...skusToUpdate.map((sku) =>
        this.prismaService.sKU.update({
          where: { id: sku.id },
          data: {
            value: sku.value,
            price: sku.price,
            stock: sku.stock,
            image: sku.image,
            updatedById,
          },
        }),
      ),

      // Tạo SKU mới
      this.prismaService.sKU.createMany({
        data: skusToCreate.map((s) => ({
          ...s,
          createdById: updatedById,
        })),
      }),
    ])

    return product
  }
}
