import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import {
  CreateDeliveryMethodDTO,
  GetDeliveryMethodQueryPaginationDTO,
  GetDeliveryMethodQueryResDTO,
  GetDeliveryMethodResponseDTO,
  UpdateDeliveryMethodDTO,
} from './delivery-method.dto'
import { DeliveryMethodService } from './delivery-method.service'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'

@Controller('delivery-methods')
export class DeliveryMethodController {
  constructor(private readonly deliveryMethodService: DeliveryMethodService) {}

  @Post()
  @ZodSerializerDto(GetDeliveryMethodResponseDTO)
  async create(@Body() body: CreateDeliveryMethodDTO, @ActiveUser('userId') userId: number) {
    return await this.deliveryMethodService.create(body, userId)
  }

  @Get()
  @ZodSerializerDto(GetDeliveryMethodQueryResDTO)
  async findAll(@Query() query: GetDeliveryMethodQueryPaginationDTO) {
    return await this.deliveryMethodService.findAll(query)
  }

  @Put(':id')
  @ZodSerializerDto(GetDeliveryMethodResponseDTO)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDeliveryMethodDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return await this.deliveryMethodService.update(id, body, userId)
  }

  @Patch(':id/toggle-status')
  @ZodSerializerDto(EmptyBodyDTO)
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number) {
    return await this.deliveryMethodService.toggleStatus(id, userId)
  }

  @Delete(':id')
  @ZodSerializerDto(EmptyBodyDTO)
  async delete(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number) {
    return await this.deliveryMethodService.delete(id, userId)
  }

  @Patch(':id/restore')
  @ZodSerializerDto(EmptyBodyDTO)
  async restore(@Param('id', ParseIntPipe) id: number) {
    return await this.deliveryMethodService.restore(id)
  }
}
