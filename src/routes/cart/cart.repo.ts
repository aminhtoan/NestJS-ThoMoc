import { Injectable, NotFoundException } from '@nestjs/common'
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

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateSKU(skuId: number): Promise<SKUSchemaType> {
    const sku = await this.prismaService.sKU.findFirst({
      where: { id: skuId, deletedAt: null },
      include: {
        product: true,
      },
    })
    // Kiểm tra tồn tại của SKU
    if (!sku) {
      throw new NotFoundException('Sản phẩm không tồn tại')
    }
    // Kiểm tra lượng hàng còn lại
    if (sku.stock < 1) {
      throw new NotFoundException('Hàng đã hết')
    }

    const { product } = sku

    // kiểm sản phẩm đã bị xóa hay chưa, có được công bố hay chưa
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt > new Date() && product.publishedAt !== null)
    ) {
      throw new NotFoundException('Sản phẩm không tồn tại')
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

  async create(body: AddToCartBodyType, userId: number): Promise<CartItemType> {
    await this.validateSKU(body.skuId)

    return await this.prismaService.cartItem.create({
      data: {
        skuId: body.skuId,
        quantity: body.quantity,
        userId,
      },
    })
  }

  async update(body: UpdateCartItemBodyType, cartItemId: number): Promise<CartItemType> {
    await this.validateSKU(body.skuId)

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
