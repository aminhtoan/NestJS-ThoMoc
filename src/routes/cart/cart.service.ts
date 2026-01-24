import { Injectable, NotFoundException } from '@nestjs/common'
import { CartRepository } from './cart.repo'
import { I18nContext } from 'nestjs-i18n'
import { AddToCartBodyType, RemoveCartItemBodyType, UpdateCartItemBodyType } from './cart.model'
import { isRecordNotFoundError } from 'src/shared/helpers'

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async list(userId: number, page: number, limit: number) {
    return await this.cartRepository.list2({ userId, languageId: I18nContext.current()?.lang, page, limit })
  }

  async create(body: AddToCartBodyType, userId: number) {
    return await this.cartRepository.create(body, userId)
  }

  async delete(userId: number, body: RemoveCartItemBodyType) {
    const res = await this.cartRepository.delete(userId, body)
    return {
      message: `Cart items ${res.count} removed successfully`,
    }
  }

  async update(body: UpdateCartItemBodyType, cartItemId: number, userId: number) {
    try {
      return await this.cartRepository.update(body, cartItemId, userId)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Cart item không tồn tại')
      }
      throw error
    }
  }
}
