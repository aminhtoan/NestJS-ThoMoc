import z from 'zod'

const BrandTranslationSchema = z.object({
  id: z.number(),
  brandId: z.number().int().positive({ message: 'brandId phải là số nguyên dương' }),
  languageId: z
    .string()
    .min(2, { message: 'languageId phải có ít nhất 2 ký tự' })
    .max(10, { message: 'languageId không được vượt quá 10 ký tự' }),
  name: z
    .string()
    .min(1, { message: 'Tên thương hiệu không được để trống' })
    .max(500, { message: 'Tên thương hiệu không được vượt quá 500 ký tự' }),
  description: z.string().optional().default(''), // Nếu không truyền thì mặc định rỗng
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const ResponeBrandTranslationSchema = BrandTranslationSchema
export const CreateTranslationSchema = BrandTranslationSchema.pick({
  brandId: true,
  languageId: true,
  name: true,
  description: true,
}).strict()

export const UpdateBrandTranslationSchema = CreateTranslationSchema.partial()

export const GetBrandTranslationParamsSchema = z.object({
  brandTranslationId: z.coerce.number().int().positive(),
})

export const GetBrandTranslationQueryResSchema = z.object({
  data: z.array(BrandTranslationSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetBrandTranslationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export type BrandTranslationType = z.infer<typeof BrandTranslationSchema>
export type UpdateBrandTranslationType = z.infer<typeof UpdateBrandTranslationSchema>
export type CreateBrandTranslationType = z.infer<typeof CreateTranslationSchema>
export type GetBrandTranslationQueryType = z.infer<typeof GetBrandTranslationQuerySchema>
export type GetBrandTranslationDetailResType = z.infer<typeof GetBrandTranslationQueryResSchema>
export type GetBrandTranslationParamsType = z.infer<typeof GetBrandTranslationParamsSchema>
export type ResponeBrandTranslationType = z.infer<typeof ResponeBrandTranslationSchema>
