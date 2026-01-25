import { ORDER_STATUS } from 'src/shared/constants/order.constant'
import z from 'zod'

const OrderSchema = z.object({
  id: z.number().int(),
  userId: z.number(),
  status: z.enum([
    ORDER_STATUS.PENDING_PAYMENT,
    ORDER_STATUS.PENDING_PICKUP,
    ORDER_STATUS.PENDING_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.RETURNED,
    ORDER_STATUS.CANCELLED,
  ]),
  receiver: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  shopId: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productId: z.number().nullable(),
  productName: z.string(),
  productTranslations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      languageId: z.string(),
    }),
  ),
  skuPrice: z.number(),
  image: z.string(),
  skuValue: z.string(),
  skuId: z.number().nullable(),
  orderId: z.number().nullable(),
  quantity: z.number(),
  createdAt: z.date(),
})

export const GetOrderListSchema = z.object({
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  data: z.array(
    OrderSchema.extend({
      items: z.array(ProductSKUSnapshotSchema),
      paymentId: z.number().optional(),
    }).omit({
      receiver: true,
      deletedAt: true,
    }),
  ),
})

export const GetOrderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  status: z
    .enum([
      ORDER_STATUS.PENDING_PAYMENT,
      ORDER_STATUS.PENDING_PICKUP,
      ORDER_STATUS.PENDING_DELIVERY,
      ORDER_STATUS.DELIVERED,
      ORDER_STATUS.RETURNED,
      ORDER_STATUS.CANCELLED,
    ])
    .optional(),
})

export const GetOrderDetailResSchema = OrderSchema.extend({
  items: z.array(ProductSKUSnapshotSchema),
})

export const CreateOrderBodySchema = z
  .array(
    z.object({
      shopId: z.number(),
      receiver: z.object({
        name: z.string(),
        phone: z.string().min(9).max(20),
        address: z.string(),
      }),
      cartItemIds: z.array(z.number()).min(1),
    }),
  )
  .min(1)

export const CreateOrderResSchema = z.object({
  data: z.array(OrderSchema.extend({ paymentId: z.number().optional() })),
})

export const CancelOrderResSchema = OrderSchema

export const GetOrderParamsSchema = z.object({
  orderId: z.coerce.number().int().positive(),
})

export type ProductSKUSnapshotType = z.infer<typeof ProductSKUSnapshotSchema>
export type OrderType = z.infer<typeof OrderSchema>
export type GetOrderListResType = z.infer<typeof GetOrderListSchema>
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
export type CancelOrderResType = z.infer<typeof CancelOrderResSchema>
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>
export type GetOrderQueryType = z.infer<typeof GetOrderQuerySchema>
