import { z } from 'zod'

export const UserTranslationSchema = z.object({
  id: z.number().int(),
  userId: z.number().int().positive(),
  languageId: z.string().min(1),
  address: z.string().max(500).nullable(),
  description: z.string().nullable(),

  createdById: z.number().int().nullable(),
  updatedById: z.number().int().nullable(),
  deletedById: z.number().int().nullable(),

  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetUserTranslationParamsSchema = z
  .object({
    userTranslationId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetUserTranslationResDetailSchema = UserTranslationSchema

export const CreateUserTranslationBodySchema = UserTranslationSchema.pick({
  userId: true,
  languageId: true,
  address: true,
  description: true,
})
  .extend({
    address: z.string().max(500).optional().nullable(),
    description: z.string().optional().nullable(),
  })
  .strict()

export const UpdateUserTranslationBodySchema = CreateUserTranslationBodySchema.partial()

export type UserTranslation = z.infer<typeof UserTranslationSchema>
export type GetUserTranslationParamsType = z.infer<typeof GetUserTranslationParamsSchema>
export type GetUserTranslationResDetailType = z.infer<typeof GetUserTranslationResDetailSchema>
export type CreateUserTranslationBodyType = z.infer<typeof CreateUserTranslationBodySchema>
export type UpdateUserTranslationBodyType = z.infer<typeof UpdateUserTranslationBodySchema>
