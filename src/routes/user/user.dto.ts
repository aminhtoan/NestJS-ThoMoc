import { createZodDto } from 'nestjs-zod'
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUserQueryResSchema,
  GetUserQuerySchema,
  UpdateUserBodySchema,
  UserResponseSchema,
} from './user.model'

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}
export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}
export class UserResponseDTO extends createZodDto(UserResponseSchema) {}
export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}
export class GetUserQueryResDTO extends createZodDto(GetUserQueryResSchema) {}
export class GetUserQueryDTO extends createZodDto(GetUserQuerySchema) {}
