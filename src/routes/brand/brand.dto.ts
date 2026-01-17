import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandSchema,
  GetBrandDetailResSchema,
  GetBrandParamsSchema,
  GetBrandQueryResSchema,
  GetBrandQuerySchema,
  UpdateBrandSchema,
} from './brand.model'

export class CreateBrandBodyDTO extends createZodDto(CreateBrandSchema) {}
export class UpdateBrandBodyDTO extends createZodDto(UpdateBrandSchema) {}
export class GetBrandQueryResDTO extends createZodDto(GetBrandQueryResSchema) {}
export class GetBrandDetailResDTO extends createZodDto(GetBrandDetailResSchema) {}
export class GetBrandParamsDTO extends createZodDto(GetBrandParamsSchema) {}
export class GetBrandQueryDTO extends createZodDto(GetBrandQuerySchema) {}
