import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import {
  AddToCartBodyDTO,
  CartItemDTO,
  DeleteCartBodyDTO,
  GetCartItemParamsDTO,
  GetCartPaginationQueryDTO,
  GetCartResDTO,
  UpdateCartItemBodyDTO,
} from './cart.dto'
import { CartService } from './cart.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ZodSerializerDto(GetCartResDTO)
  async getCart(@ActiveUser('userId') userId: number, @Query() query: GetCartPaginationQueryDTO) {
    return await this.cartService.list(userId, query.page, query.limit)
  }

  @Post()
  @ZodSerializerDto(CartItemDTO)
  async addToCart(@ActiveUser('userId') userId: number, @Body() body: AddToCartBodyDTO) {
    return await this.cartService.create(body, userId)
  }

  @Patch(':cartItemId')
  @ZodSerializerDto(CartItemDTO)
  async updateCartItem(@Param() params: GetCartItemParamsDTO, @Body() body: UpdateCartItemBodyDTO) {
    return await this.cartService.update(body, params.cartItemId)
  }

  @Post('remove')
  @ZodSerializerDto(MessageResDto)
  async removeCartItem(@ActiveUser('userId') userId: number, @Body() body: DeleteCartBodyDTO) {
    return await this.cartService.delete(userId, body)
  }
}
