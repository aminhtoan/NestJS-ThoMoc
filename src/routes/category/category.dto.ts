import { createZodDto } from 'nestjs-zod'
import {
  CreateCategoryBodySchema,
  GetAllCategoriesQuerySchema,
  GetAllCategoriesResSchema,
  GetCategoryDetailResSchema,
  GetCategoryParamsSchema,
  UpdateCategoryBodySchema,
} from './category.model'

export class CreateCategoryBodyDto extends createZodDto(CreateCategoryBodySchema) {}

export class UpdateCategoryBodyDto extends createZodDto(UpdateCategoryBodySchema) {}

export class GetCategoryParamsDto extends createZodDto(GetCategoryParamsSchema) {}

export class GetAllCategoriesResDto extends createZodDto(GetAllCategoriesResSchema) {}

export class GetCategoryDetailResDto extends createZodDto(GetCategoryDetailResSchema) {}

export class GetAllCategoriesQueryDTO extends createZodDto(GetAllCategoriesQuerySchema) {}
