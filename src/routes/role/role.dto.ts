import { createZodDto } from 'nestjs-zod'
import {
  CreateRoleBodySchema,
  GetRoleParamsSchema,
  GetRoleDetailResSchema,
  UpdateRoleBodySchema,
  GetRoleQueryResSchema,
  GetRoleQuerySchema,
} from './role.model'

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}
export class GetRoleDetailResDTO extends createZodDto(GetRoleDetailResSchema) {}
export class GetPermissionParamsDTO extends createZodDto(GetRoleParamsSchema) {}
export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}
export class GetRoleQueryResDTO extends createZodDto(GetRoleQueryResSchema) {}
export class GetRoleQueryDTO extends createZodDto(GetRoleQuerySchema) {}
