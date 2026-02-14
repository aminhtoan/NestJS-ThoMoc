import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { CreateDeliveryMethodDTO, UpdateDeliveryMethodDTO } from './delivery-method.dto'
import { DeliveryMethodService } from './delivery-method.service'

@Controller('delivery-methods')
export class DeliveryMethodController {
  constructor(private readonly deliveryMethodService: DeliveryMethodService) {}

  @Post()
  async create(@Body() body: CreateDeliveryMethodDTO, @ActiveUser('userId') userId: number) {
    return await this.deliveryMethodService.create(body, userId)
  }

  @Get()
  async findAll() {
    return await this.deliveryMethodService.findAll()
  }

  @Get('active')
  async getActive() {
    return await this.deliveryMethodService.getActiveDeliveryMethods()
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.deliveryMethodService.findById(id)
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return await this.deliveryMethodService.findByCode(code)
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateDeliveryMethodDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return await this.deliveryMethodService.update(id, body, userId)
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number) {
    return await this.deliveryMethodService.toggleStatus(id, userId)
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number) {
    return await this.deliveryMethodService.delete(id, userId)
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number) {
    return await this.deliveryMethodService.restore(id)
  }
}
