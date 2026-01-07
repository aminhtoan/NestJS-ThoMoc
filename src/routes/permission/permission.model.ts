import { HTTPsMethod } from 'src/shared/constants/role.constant'
import z from 'zod'

const PermissionSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  path: z.string(),
  method: z.enum(HTTPsMethod),
  module: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export const GetPermissionQueryResSchema = z.object({
  data: z.array(PermissionSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetPermissionQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export const GetPermissionParamsSchema = z.object({
  permissionId: z.coerce.number().int().positive(),
})

export const GetPermissionDetailResSchema = PermissionSchema

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
})

export const CreatePermissionResSchema = PermissionSchema

export const UpdatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
}).partial()

export type PermissionType = z.infer<typeof PermissionSchema>
export type GetPermissionQueryType = z.infer<typeof GetPermissionQuerySchema>
export type GetPermissionQueryResType = z.infer<typeof GetPermissionQueryResSchema>
export type GetPermissionParamType = z.infer<typeof GetPermissionParamsSchema>
export type GetPermissionDetailResType = z.infer<typeof GetPermissionDetailResSchema>
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>
export type CreatePermissionResType = z.infer<typeof CreatePermissionResSchema>
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>
export type UpdatePermissionResType = z.infer<typeof CreatePermissionResSchema>
