import { Injectable } from '@nestjs/common'
import { CreatePaymentMethodType, UpdatePaymentMethodType } from './payment.model'
import { PaymentMethodRepository } from './paymentMethod.repo'

@Injectable()
export class PaymentMethodService {
  constructor(private readonly paymentMethodRepo: PaymentMethodRepository) {}

  async createPaymentMethod(data: CreatePaymentMethodType, createdById?: number) {
    return await this.paymentMethodRepo.create(data, createdById)
  }

  async getAllPaymentMethods() {
    return await this.paymentMethodRepo.findAll()
  }

  async getActivePaymentMethods() {
    return await this.paymentMethodRepo.getActivePaymentMethods()
  }

  async getPaymentMethodById(id: number) {
    return await this.paymentMethodRepo.findById(id)
  }

  async getPaymentMethodByCode(code: string) {
    return await this.paymentMethodRepo.findByCode(code)
  }

  async updatePaymentMethod(id: number, data: UpdatePaymentMethodType, updatedById?: number) {
    return await this.paymentMethodRepo.update(id, data, updatedById)
  }

  async deletePaymentMethod(id: number, deletedById?: number) {
    return await this.paymentMethodRepo.delete(id, deletedById)
  }

  async restorePaymentMethod(id: number) {
    return await this.paymentMethodRepo.restore(id)
  }

  async togglePaymentMethodStatus(id: number, updatedById?: number) {
    const paymentMethod = await this.paymentMethodRepo.findById(id)
    return await this.paymentMethodRepo.update(id, { isActive: !paymentMethod.isActive }, updatedById)
  }
}
