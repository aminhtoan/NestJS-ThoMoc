import z from 'zod'
import { CategoryTranslationSchema } from './category-translation/category-translation.model'

const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  logo: z.string().nullable(),
  parentCategoryId: z.number().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

const CategoryIncludeTranslationSchema = CategorySchema.extend({
  categoryTranslations: z.array(CategoryTranslationSchema),
})

export const GetAllCategoriesResSchema = z.object({
  data: z.array(CategoryIncludeTranslationSchema),
  totalItems: z.number(),
})

export const GetAllCategoriesQuerySchema = z.object({
  parentCategoryId: z.coerce.number().int().positive().optional(),
  lang: z.string().optional(),
})

export const GetCategoryParamsSchema = z
  .object({
    categoryId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetCategoryDetailResSchema = CategoryIncludeTranslationSchema

export const CreateCategoryBodySchema = CategorySchema.pick({
  name: true,
  logo: true,
  parentCategoryId: true,
}).strict()

export const UpdateCategoryBodySchema = CreateCategoryBodySchema.partial()

export type CategoryType = z.infer<typeof CategorySchema>
export type CategoryWithTranslationsType = z.infer<typeof CategoryIncludeTranslationSchema>
export type GetAllCategoriesResponseType = z.infer<typeof GetAllCategoriesResSchema>
export type GetAllCategoriesQueryType = z.infer<typeof GetAllCategoriesQuerySchema>
export type GetCategoryDetailResponseType = z.infer<typeof GetCategoryDetailResSchema>
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>
