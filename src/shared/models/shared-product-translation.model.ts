import z from 'zod'

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

export type ProductTranslation = z.infer<typeof ProductTranslationSchema>
