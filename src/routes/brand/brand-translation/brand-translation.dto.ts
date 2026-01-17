import { createZodDto } from 'nestjs-zod'
import {
  CreateTranslationSchema,
  GetBrandTranslationParamsSchema,
  GetBrandTranslationQueryResSchema,
  GetBrandTranslationQuerySchema,
  ResponeBrandTranslationSchema,
  UpdateBrandTranslationSchema,
} from './brand-translation.model'

export class CreateTranslationDTO extends createZodDto(CreateTranslationSchema) {}
export class UpdateBrandTranslationDTO extends createZodDto(UpdateBrandTranslationSchema) {}
export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}
export class GetBrandTranslationQueryDTO extends createZodDto(GetBrandTranslationQuerySchema) {}
export class GetBrandTranslationQueryResDTO extends createZodDto(GetBrandTranslationQueryResSchema) {}
export class ResponeBrandTranslationDTO extends createZodDto(ResponeBrandTranslationSchema) {}
