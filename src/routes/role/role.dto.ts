import { createZodDto } from 'nestjs-zod'
import { CreateRoleBodySchema, GetRoleParamsSchema, GetRoleDetailResSchema, UpdateRoleBodySchema } from './role.model'

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}
export class GetRoleDetailResDTO extends createZodDto(GetRoleDetailResSchema) {}
export class GetPermissionParamsDTO extends createZodDto(GetRoleParamsSchema) {}
export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}
