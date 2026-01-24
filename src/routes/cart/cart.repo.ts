import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { All_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { SKUSchemaType } from 'src/shared/models/shared-sku.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  AddToCartBodyType,
  CartItemDetailType,
  CartItemType,
  GetCartResType,
  RemoveCartItemBodyType,
  UpdateCartItemBodyType,
} from './cart.model'
import { Prisma } from '@prisma/client'

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateSKU(skuId: number, quantity: number, userId: number): Promise<SKUSchemaType> {
    const sku = await this.prismaService.sKU.findFirst({
      where: { id: skuId, deletedAt: null },
      include: {
        product: true,
      },
    })
    // Kiểm tra tồn tại của SKU
    if (!sku) throw new NotFoundException('Sản phẩm không tồn tại')
    // Kiểm tra lượng hàng còn lại
    if (sku.stock < 1) throw new NotFoundException('Hàng đã hết')

    const { product } = sku

    // kiểm sản phẩm đã bị xóa hay chưa, có được công bố hay chưa
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt > new Date() && product.publishedAt !== null)
    ) {
      throw new NotFoundException('Sản phẩm không tồn tại')
    }

    const existingCartItem = await this.prismaService.cartItem.findUnique({
      where: {
        userId_skuId: { userId, skuId },
      },
    })

    const currentQtyInCart = existingCartItem?.quantity || 0
    const totalAfterAdding = currentQtyInCart + quantity

    // Nếu tổng dự kiến > tồn kho thì báo lỗi luôn
    if (totalAfterAdding > sku.stock) {
      throw new BadRequestException(
        `Bạn đã có ${currentQtyInCart} sp trong giỏ. Không thể thêm ${quantity} vì vượt quá tồn kho (${sku.stock})`,
      )
    }
    return sku
  }

  async list({
    userId,
    languageId,
    page,
    limit,
  }: {
    userId: number
    languageId: string
    page: number
    limit: number
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit

    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        userId,
        sku: {
          product: {
            deletedAt: null,
            publishedAt: {
              lte: new Date(),
              not: null,
            },
            // createdById: {
            //   not: null,
            // },
          },
        },
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: {
                  where: languageId === All_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
                },
                createdBy: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })
    const groupMap = new Map<number, CartItemDetailType>()
    for (const cartItem of cartItems) {
      const shopId = cartItem.sku.product.createdById
      if (shopId) {
        if (!groupMap.has(shopId)) {
          groupMap.set(shopId, { shop: cartItem.sku.product.createdBy, cartItems: [] })
        }
        groupMap.get(shopId)?.cartItems.push(cartItem)
      }
    }

    const sortGourp = Array.from(groupMap.values())
    const data = sortGourp.slice(skip, skip + limit)
    const totalItems = sortGourp.length
    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async list2({
    userId,
    languageId,
    page,
    limit,
  }: {
    userId: number
    languageId: string
    limit: number
    page: number
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit
    const take = limit
    // Đếm tổng số nhóm sản phẩm
    const totalItems$ = this.prismaService.$queryRaw<{ createdById: number }[]>`
      SELECT
        -- "Product"."createdById"
      FROM "CartItem"
      JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
      JOIN "Product" ON "SKU"."productId" = "Product"."id"
      WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
      GROUP BY "Product"."createdById"
    `
    const data$ = await this.prismaService.$queryRaw<CartItemDetailType[]>`
     SELECT
       "Product"."createdById",
       json_agg(
         jsonb_build_object(
           'id', "CartItem"."id",
           'quantity', "CartItem"."quantity",
           'skuId', "CartItem"."skuId",
           'userId', "CartItem"."userId",
           'createdAt', "CartItem"."createdAt",
           'updatedAt', "CartItem"."updatedAt",
           'sku', jsonb_build_object(
             'id', "SKU"."id",
              'value', "SKU"."value",
              'price', "SKU"."price",
              'stock', "SKU"."stock",
              'image', "SKU"."image",
              'productId', "SKU"."productId",
              'product', jsonb_build_object(
                'id', "Product"."id",
                'publishedAt', "Product"."publishedAt",
                'name', "Product"."name",
                'basePrice', "Product"."basePrice",
                'virtualPrice', "Product"."virtualPrice",
                'brandId', "Product"."brandId",
                'images', "Product"."images",
                'variants', "Product"."variants",
                'productTranslations', COALESCE((
                  SELECT json_agg(
                    jsonb_build_object(
                      'id', pt."id",
                      'productId', pt."productId",
                      'languageId', pt."languageId",
                      'name', pt."name",
                      'description', pt."description"
                    )
                  ) FILTER (WHERE pt."id" IS NOT NULL)
                  FROM "ProductTranslation" pt
                  WHERE pt."productId" = "Product"."id"
                    AND pt."deletedAt" IS NULL
                    ${languageId === All_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND pt."languageId" = ${languageId}`}
                ), '[]'::json)
              )
           )
         )
       ) AS "cartItems",
       jsonb_build_object(
         'id', "User"."id",
         'name', "User"."name",
         'avatar', "User"."avatar"
       ) AS "shop"
     FROM "CartItem"
     JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
     JOIN "Product" ON "SKU"."productId" = "Product"."id"
     LEFT JOIN "ProductTranslation" ON "Product"."id" = "ProductTranslation"."productId"
       AND "ProductTranslation"."deletedAt" IS NULL
       ${languageId === All_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND "ProductTranslation"."languageId" = ${languageId}`}
     LEFT JOIN "User" ON "Product"."createdById" = "User"."id"
     WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
     GROUP BY "Product"."createdById", "User"."id"
     ORDER BY MAX("CartItem"."updatedAt") DESC
      LIMIT ${take}
      OFFSET ${skip}
   `
    const [data, totalItems] = await Promise.all([data$, totalItems$])
    return {
      data,
      page,
      limit,
      totalItems: totalItems.length,
      totalPages: Math.ceil(totalItems.length / limit),
    }
  }

  async create(body: AddToCartBodyType, userId: number): Promise<CartItemType> {
    await this.validateSKU(body.skuId, body.quantity, userId)
    return await this.prismaService.cartItem.upsert({
      where: {
        // Prisma tự tạo tên field ghép từ 2 cột unique
        userId_skuId: {
          userId: userId,
          skuId: body.skuId,
        },
      },
      // A. Nếu tìm thấy (Update) -> Cộng dồn số lượng
      update: {
        quantity: {
          increment: body.quantity,
        },
      },
      // B. Nếu chưa có (Create) -> Tạo mới
      create: {
        userId: userId,
        skuId: body.skuId,
        quantity: body.quantity,
      },
    })
  }

  async update(body: UpdateCartItemBodyType, cartItemId: number, userId: number): Promise<CartItemType> {
    await this.validateSKU(body.skuId, body.quantity, userId)

    return await this.prismaService.cartItem.update({
      where: {
        id: cartItemId,
      },
      data: {
        skuId: body.skuId,
        quantity: body.quantity,
      },
    })
  }

  async delete(userId: number, body: RemoveCartItemBodyType): Promise<{ count: number }> {
    return await this.prismaService.cartItem.deleteMany({
      where: {
        id: {
          in: body.cartItemIds,
        },
        userId,
      },
    })
  }
}
