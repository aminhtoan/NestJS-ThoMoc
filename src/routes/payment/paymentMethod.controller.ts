import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CreatePaymentMethodDTO, UpdatePaymentMethodDTO } from './payment.dto'
import { PaymentMethodService } from './paymentMethod.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  async createPaymentMethod(
    @Body() createPaymentMethodDto: CreatePaymentMethodDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return await this.paymentMethodService.createPaymentMethod(createPaymentMethodDto, userId)
  }

  @Get()
  async getAllPaymentMethods() {
    return await this.paymentMethodService.getAllPaymentMethods()
  }

  @Get('active')
  async getActivePaymentMethods() {
    return await this.paymentMethodService.getActivePaymentMethods()
  }

  @Get(':id')
  async getPaymentMethodById(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentMethodService.getPaymentMethodById(id)
  }

  @Get('code/:code')
  async getPaymentMethodByCode(@Param('code') code: string) {
    return await this.paymentMethodService.getPaymentMethodByCode(code)
  }

  @Put(':id')
  async updatePaymentMethod(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return await this.paymentMethodService.updatePaymentMethod(id, updatePaymentMethodDto, userId)
  }

  @Patch(':id/toggle-status')
  async togglePaymentMethodStatus(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number) {
    return await this.paymentMethodService.togglePaymentMethodStatus(id, userId)
  }

  @Delete(':id')
  async deletePaymentMethod(@Param('id', ParseIntPipe) id: number, @ActiveUser('userId') userId: number) {
    return await this.paymentMethodService.deletePaymentMethod(id, userId)
  }

  @Patch(':id/restore')
  async restorePaymentMethod(@Param('id', ParseIntPipe) id: number) {
    return await this.paymentMethodService.restorePaymentMethod(id)
  }
}
