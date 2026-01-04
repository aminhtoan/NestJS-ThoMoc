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

export type RoleType = z.infer<typeof RoleSchema>
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>
