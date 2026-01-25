import { CreateOrderBodyType, GetOrderQueryType } from './order.model'
import { OrderProducer } from './order.producer'
import { OrderRepository } from './order.repo'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OrderService {
  constructor(
    private readonly OrderRepository: OrderRepository,
    private orderProducer: OrderProducer,
  ) {}
  async list(userId: number, query: GetOrderQueryType) {
    const res = await this.OrderRepository.list({ userId: userId, ...query })
    return res
  }

  async create(userId: number, body: CreateOrderBodyType) {
    const orders = await this.OrderRepository.create(userId, body)
    await Promise.all(
      orders.data.map((order) => {
        // Kiểm tra chắc chắn có payment thì mới gọi queue
        if (order.paymentId) {
          return this.orderProducer.canclePayment(order.paymentId.toString())
        }
      }),
    )

    return orders
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
