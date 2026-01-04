import { PermissionSchema } from 'src/shared/models/shared-permission.model'
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

export const GetRoleDetailResSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
})

export const GetRoleParamsSchema = z.object({
  roleId: z.coerce.number().int().positive(),
})

export const UpdateRoleBodySchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
})
  .partial()
  .extend({ permissionIds: z.array(z.number().int()).optional() })

export const GetRoleQueryResSchema = z.object({
  data: z.array(GetRoleDetailResSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetRoleQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export type RoleType = z.infer<typeof RoleSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
export type GetRoleQueryResType = z.infer<typeof GetRoleQueryResSchema>
export type GetRoleQueryType = z.infer<typeof GetRoleQuerySchema>
