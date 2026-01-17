import z from 'zod'

const BrandSchema = z.object({
  id: z.number(),
  logo: z
    .string()
    .url({ message: 'Logo phải là URL hợp lệ' })
    .max(1000, { message: 'Logo không được vượt quá 1000 ký tự' }),
  name: z
    .string()
    .min(1, { message: 'Tên thương hiệu không được để trống' })
    .max(500, { message: 'Tên thương hiệu không được vượt quá 500 ký tự' }),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

const BrandTranslationSchema = z.object({
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

export const CreateBrandSchema = BrandSchema.pick({
  logo: true,
  name: true,
}).strict()

export const UpdateBrandSchema = BrandSchema.partial()

export const GetBrandParamsSchema = z.object({
  brandId: z.coerce.number().int().positive(),
})

export const GetBrandDetailResSchema = BrandSchema.extend({
  brandTranslations: z.array(BrandTranslationSchema).optional(),
})

export const GetBrandQueryResSchema = z.object({
  data: z.array(GetBrandDetailResSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetBrandQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export type BrandType = z.infer<typeof BrandSchema>
export type UpdateBrandType = z.infer<typeof UpdateBrandSchema>
export type CreateBrandType = z.infer<typeof CreateBrandSchema>
export type GetBrandQueryResType = z.infer<typeof GetBrandQueryResSchema>
export type GetBrandQueryType = z.infer<typeof GetBrandQuerySchema>
export type GetBrandDetailResType = z.infer<typeof GetBrandDetailResSchema>
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>
