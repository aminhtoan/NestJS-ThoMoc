import { CreateOrderBodyType, GetOrderQueryType } from './order.model'
import { OrderRepository } from './order.repo'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OrderService {
  constructor(private readonly OrderRepository: OrderRepository) {}
  async list(userId: number, query: GetOrderQueryType) {
    const res = await this.OrderRepository.list({ userId: userId, ...query })
    return res
  }

  async create(userId: number, body: CreateOrderBodyType) {
    const res = await this.OrderRepository.create(userId, body)
    return res
  }

  async getDetail(userId: number, orderId: number) {
    const res = await this.OrderRepository.findDetailOrder(userId, orderId)
    return res
  }

  async cancelOrder(userId: number, orderId: number) {
    const res = await this.OrderRepository.cancelOrder(userId, orderId)
    return res
  }
}
