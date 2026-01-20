import { createZodDto } from 'nestjs-zod'
import {
  CreateUserTranslationBodySchema,
  GetUserTranslationParamsSchema,
  GetUserTranslationResDetailSchema,
  UpdateUserTranslationBodySchema,
} from './user-translation.model'

export class GetUserTranslationDetailResDTO extends createZodDto(GetUserTranslationResDetailSchema) {}
export class GetUserTranslationParamsDTO extends createZodDto(GetUserTranslationParamsSchema) {}
export class CreateUserTranslationBodyDTO extends createZodDto(CreateUserTranslationBodySchema) {}
export class UpdateUserTranslationBodyDTO extends createZodDto(UpdateUserTranslationBodySchema) {}
