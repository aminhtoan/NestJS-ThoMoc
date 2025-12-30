import { createZodDto } from 'nestjs-zod'
import {
  CreatePermissionBodySchema,
  CreatePermissionResSchema,
  GetPermissionDetailResSchema,
  GetPermissionParamsSchema,
  GetPermissionQueryResSchema,
  GetPermissionQuerySchema,
  UpdatePermissionBodySchema,
} from './permission.model'

export class GetPermissionQueryDTO extends createZodDto(GetPermissionQuerySchema) {}
export class GetPermissionQueryResDTO extends createZodDto(GetPermissionQueryResSchema) {}
export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}
export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}
export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}
export class CreatePermissionResDTO extends createZodDto(CreatePermissionResSchema) {}
export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

