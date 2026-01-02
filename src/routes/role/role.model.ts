import z from 'zod'

export const RoleSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export const CreateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
})

export const GetRoleDetailResSchema = RoleSchema

export const GetRoleParamsSchema = z.object({
  roleName: z.string(),
})

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).partial()

export type RoleType = z.infer<typeof RoleSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
