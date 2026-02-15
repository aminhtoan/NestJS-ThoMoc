import { Injectable } from '@nestjs/common'
import {
  CreateDeliveryMethodType,
  GetDeliveryMethodQueryPaginationType,
  UpdateDeliveryMethodType,
} from './delivery-method.model'
import { DeliveryMethodRepository } from './delivery-method.repo'

@Injectable()
export class DeliveryMethodService {
  constructor(private readonly deliveryMethodRepo: DeliveryMethodRepository) {}

  async create(data: CreateDeliveryMethodType, createdById?: number) {
    return await this.deliveryMethodRepo.create(data, createdById)
  }

  async findAll(query: GetDeliveryMethodQueryPaginationType) {
    return await this.deliveryMethodRepo.findAll(query)
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
    await this.deliveryMethodRepo.delete(id, deletedById)
    return {}
  }

  async restore(id: number) {
    await this.deliveryMethodRepo.restore(id)
    return {}
  }

  async toggleStatus(id: number, updatedById?: number) {
    const deliveryMethod = await this.deliveryMethodRepo.findById(id)
    await this.deliveryMethodRepo.update(id, { isActive: !deliveryMethod.isActive }, updatedById)
    return {}
  }
}
