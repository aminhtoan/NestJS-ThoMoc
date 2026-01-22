import { ProductTranslationSchema } from 'src/shared/models/shared-product-translation.model'
import { ProductSchema } from 'src/shared/models/shared-product.model'
import { SKUSchema } from 'src/shared/models/shared-sku.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number().int().positive(),
  skuId: z.number(),
  userId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export const GetCartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
})

// vô trang giỏ hàng cái này là cái khung bao cái dưới GetCartResSchema
export const CartItemDetailSchema = z.object({
  shop: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SKUSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(ProductTranslationSchema),
        }),
      }),
    }),
  ),
})

// cái này là dùng để fill ra dũng sản phẩn mà người dùng đã thêm vào giả hàng
export const GetCartResSchema = z.object({
  data: z.array(CartItemDetailSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const AddToCartBodySchema = CartItemSchema.pick({
  skuId: true,
  quantity: true,
}).strict()

export const UpdateCartItemBodySchema = AddToCartBodySchema

export const RemoveCartItemBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()),
  })
  .strict()

export const GetCartPaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
})

export type CartItemType = z.infer<typeof CartItemSchema>
export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>
export type GetCartResType = z.infer<typeof GetCartResSchema>
export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>
export type RemoveCartItemBodyType = z.infer<typeof RemoveCartItemBodySchema>
export type GetCartItemParamsType = z.infer<typeof GetCartItemParamsSchema>
