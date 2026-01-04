import z from 'zod'
import { HTTPsMethod } from '../constants/role.constant'

export const PermissionSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string(),
  path: z.string(),
  method: z.enum(HTTPsMethod),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export const GetPermissionParamsSchema = z.object({
  permissionId: z.coerce.number().int().positive(),
})

export type GetPermissionParamType = z.infer<typeof GetPermissionParamsSchema>
