import { GetOrderQueryType } from './order.model'
import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { OrderService } from './order.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { CreateOrderBodyDTO, CreateOrderResDTO, GetOrderListResDTO, GetOrderQueryDTO } from './order.dto'
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
}
