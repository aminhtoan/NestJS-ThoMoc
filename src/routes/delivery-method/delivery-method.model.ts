import z from 'zod'

export const DeliveryMethodSchema = z.object({
  id: z.number().int(),
  name: z.string().max(100),
  code: z.string().max(50),
  price: z.number().int().default(0),
  description: z.string().max(500).nullable().optional(),
  isActive: z.boolean().default(true),
  createdById: z.number().int().nullable().optional(),
  updatedById: z.number().int().nullable().optional(),
  deletedById: z.number().int().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetQueryPagination = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export const GetDeliveryMethodQueryResSchema = z.object({
  data: z.array(DeliveryMethodSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const CreateDeliveryMethodSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(50),
  price: z.number().int().min(0),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
})

export const UpdateDeliveryMethodSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(50).optional(),
  price: z.number().int().min(0).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
})

export const GetDeliveryMethodParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const GetDeliveryMethodByCodeParamsSchema = z.object({
  code: z.string().min(1),
})

export const DeliveryRespone = DeliveryMethodSchema

export type DeliveryMethodType = z.infer<typeof DeliveryMethodSchema>
export type CreateDeliveryMethodType = z.infer<typeof CreateDeliveryMethodSchema>
export type UpdateDeliveryMethodType = z.infer<typeof UpdateDeliveryMethodSchema>
export type GetDeliveryMethodParamsType = z.infer<typeof GetDeliveryMethodParamsSchema>
export type GetDeliveryMethodByCodeParamsType = z.infer<typeof GetDeliveryMethodByCodeParamsSchema>
export type GetDeliveryMethodQueryResType = z.infer<typeof GetDeliveryMethodQueryResSchema>
export type GetDeliveryMethodQueryPaginationType = z.infer<typeof GetQueryPagination>
export type DeliveryMethodResponseType = z.infer<typeof DeliveryRespone>
