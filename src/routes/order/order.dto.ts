import { createZodDto } from 'nestjs-zod'
import {
  CancelOrderResSchema,
  CreateOrderBodySchema,
  CreateOrderResSchema,
  GetOrderDetailResSchema,
  GetOrderListSchema,
  GetOrderParamsSchema,
  GetOrderQuerySchema,
  ProductSKUSnapshotSchema,
} from './order.model'

// 1. Get Order List Response DTO
export class GetOrderListResDTO extends createZodDto(GetOrderListSchema) {}

// 2. Get Order Detail Response DTO
export class GetOrderDetailResDTO extends createZodDto(GetOrderDetailResSchema) {}

// 3. Create Order Body DTO
export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

// 4. Create Order Response DTO
export class CreateOrderResDTO extends createZodDto(CreateOrderResSchema) {}

// 5. Cancel Order Response DTO
export class CancelOrderResDTO extends createZodDto(CancelOrderResSchema) {}

// 6. Get Order Params DTO
export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}

export class GetOrderQueryDTO extends createZodDto(GetOrderQuerySchema) {}
