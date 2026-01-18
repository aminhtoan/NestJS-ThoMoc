import { z } from 'zod'

export const ProductTranslationSchema = z.object({
  id: z.number().int(),
  productId: z.number().int().positive(),
  languageId: z.string(),
  name: z.string().max(500),
  description: z.string(),

  createdById: z.number().int().nullable(),
  updatedById: z.number().int().nullable(),
  deletedById: z.number().int().nullable(),

  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetProductTranslationParamsSchema = z
  .object({
    productTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetProductTranslationResDetailSchema = ProductTranslationSchema

export const CreateProductTranslationBodySchema = ProductTranslationSchema.pick({
  productId: true,
  name: true,
  description: true,
  languageId: true,
}).strict()

export const UpdateProductTranslationBodySchema = CreateProductTranslationBodySchema

export type ProductTranslation = z.infer<typeof ProductTranslationSchema>
export type GetProductTranslationParamsType = z.infer<typeof GetProductTranslationParamsSchema>
export type GetProductTranslationResDetailType = z.infer<typeof GetProductTranslationResDetailSchema>
export type CreateProductTranslationBodyType = z.infer<typeof CreateProductTranslationBodySchema>
export type UpdateProductTranslationBodyType = z.infer<typeof UpdateProductTranslationBodySchema>
