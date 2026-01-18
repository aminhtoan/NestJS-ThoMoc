import { createZodDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodySchema,
  GetProductTranslationParamsSchema,
  GetProductTranslationResDetailSchema,
  UpdateProductTranslationBodySchema,
} from './product-translation.model'

export class GetProductTranslationDetailResDTO extends createZodDto(GetProductTranslationResDetailSchema) {}
export class GetProductTranslationParamsDTO extends createZodDto(GetProductTranslationParamsSchema) {}
export class CreateProductTranslationBodyDTO extends createZodDto(CreateProductTranslationBodySchema) {}
export class UpdateProductTranslationBodyDTO extends createZodDto(UpdateProductTranslationBodySchema) {}
