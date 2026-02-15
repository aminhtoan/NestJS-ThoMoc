import { createZodDto } from 'nestjs-zod'
import {
  CreateDeliveryMethodSchema,
  DeliveryMethodSchema,
  DeliveryRespone,
  GetDeliveryMethodByCodeParamsSchema,
  GetDeliveryMethodParamsSchema,
  GetDeliveryMethodQueryResSchema,
  GetQueryPagination,
  UpdateDeliveryMethodSchema,
} from './delivery-method.model'

export class DeliveryMethodDTO extends createZodDto(DeliveryMethodSchema) {}
export class CreateDeliveryMethodDTO extends createZodDto(CreateDeliveryMethodSchema) {}
export class UpdateDeliveryMethodDTO extends createZodDto(UpdateDeliveryMethodSchema) {}
export class GetDeliveryMethodParamsDTO extends createZodDto(GetDeliveryMethodParamsSchema) {}
export class GetDeliveryMethodByCodeParamsDTO extends createZodDto(GetDeliveryMethodByCodeParamsSchema) {}
export class GetDeliveryMethodQueryResDTO extends createZodDto(GetDeliveryMethodQueryResSchema) {}
export class GetDeliveryMethodQueryPaginationDTO extends createZodDto(GetQueryPagination) {}
export class GetDeliveryMethodResponseDTO extends createZodDto(DeliveryRespone) {}
