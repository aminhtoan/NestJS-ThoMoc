import { UpdateBrandBodyDTO } from './../brand/brand.dto'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateProductBodyType,
  GetProductDetailResType,
  GetProductsQueryType,
  GetProductsResType,
  ProductType,
  UpdateProductBodyType,
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
