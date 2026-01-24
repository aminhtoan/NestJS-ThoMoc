import { GetOrderQueryType } from './order.model'
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { OrderService } from './order.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import {
  CancelOrderResDTO,
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderDetailResDTO,
  GetOrderListResDTO,
  GetOrderParamsDTO,
  GetOrderQueryDTO,
} from './order.dto'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ZodSerializerDto(GetOrderListResDTO)
  list(@ActiveUser('userId') userId: number, @Query() query: GetOrderQueryDTO) {
    return this.orderService.list(userId, query)
  }

  @Post()
  @ZodSerializerDto(CreateOrderResDTO)
  create(@ActiveUser('userId') userId: number, @Body() body: CreateOrderBodyDTO) {
    return this.orderService.create(userId, body)
  }

  @Get('detail/:orderId')
  @ZodSerializerDto(GetOrderDetailResDTO)
  getDetail(@ActiveUser('userId') userId: number, @Param() params: GetOrderParamsDTO) {
    return this.orderService.getDetail(userId, params.orderId)
  }

  @Delete('cancel/:orderId')
  @ZodSerializerDto(CancelOrderResDTO)
  deleteOrder(@ActiveUser('userId') userId: number, @Param() params: GetOrderParamsDTO) {
    return this.orderService.cancelOrder(userId, params.orderId)
  }
}
