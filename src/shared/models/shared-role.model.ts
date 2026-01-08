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

export const GetRoleDetailResSchema = RoleSchema.extend({
  permissions: z.array(PermissionSchema),
})
