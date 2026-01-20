import { createZodDto } from 'nestjs-zod'
import {
  CreateProductBodySchema,
  GetManagerProductsQuerySchema,
  GetProductDetailResSchema,
  GetProductParamsSchema,
  GetProductsQuerySchema,
  GetProductsResSchema,
  ProductSchema,
  UpdateProductBodySchema,
} from './product.model'

export class ProductsResDTO extends createZodDto(ProductSchema) {}
export class GetProductsResDTO extends createZodDto(GetProductsResSchema) {}
export class GetProductsQueryDTO extends createZodDto(GetProductsQuerySchema) {}
export class GetProductParamsDTO extends createZodDto(GetProductParamsSchema) {}
export class GetProductDetailResDTO extends createZodDto(GetProductDetailResSchema) {}
export class CreateProductBodyDTO extends createZodDto(CreateProductBodySchema) {}
export class UpdateProductBodyDTO extends createZodDto(UpdateProductBodySchema) {}
export class GetManagerProductsQueryDTO extends createZodDto(GetManagerProductsQuerySchema) {}
