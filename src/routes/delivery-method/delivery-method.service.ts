import { Injectable } from '@nestjs/common'
import { CreateDeliveryMethodType, UpdateDeliveryMethodType } from './delivery-method.model'
import { DeliveryMethodRepository } from './delivery-method.repo'

@Injectable()
export class DeliveryMethodService {
  constructor(private readonly deliveryMethodRepo: DeliveryMethodRepository) {}

  async create(data: CreateDeliveryMethodType, createdById?: number) {
    return await this.deliveryMethodRepo.create(data, createdById)
  }

  async findAll() {
    return await this.deliveryMethodRepo.findAll()
  }

  async getActiveDeliveryMethods() {
    return await this.deliveryMethodRepo.getActiveDeliveryMethods()
  }

  async findById(id: number) {
    return await this.deliveryMethodRepo.findById(id)
  }

  async findByCode(code: string) {
    return await this.deliveryMethodRepo.findByCode(code)
  }

  async update(id: number, data: UpdateDeliveryMethodType, updatedById?: number) {
    return await this.deliveryMethodRepo.update(id, data, updatedById)
  }

  async delete(id: number, deletedById?: number) {
    return await this.deliveryMethodRepo.delete(id, deletedById)
  }

  async restore(id: number) {
    return await this.deliveryMethodRepo.restore(id)
  }

  async toggleStatus(id: number, updatedById?: number) {
    const deliveryMethod = await this.deliveryMethodRepo.findById(id)
    return await this.deliveryMethodRepo.update(id, { isActive: !deliveryMethod.isActive }, updatedById)
  }
}
