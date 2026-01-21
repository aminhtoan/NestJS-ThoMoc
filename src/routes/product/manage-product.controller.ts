import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ProductService } from './product.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import {
  CreateProductBodyDTO,
  GetManagerProductsQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
  ProductsResDTO,
  UpdateProductBodyDTO,
} from './product.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { ManageProductService } from './manage-product.service'
import { AccessTokenPayLoad } from 'src/shared/types/jwt.type'

@Controller('manage-product/product')
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetManagerProductsQueryDTO, @ActiveUser() user: AccessTokenPayLoad) {
    console.log(query)
    return this.manageProductService.getProducts({ query, userIdRequest: user.userId, roleNameRequest: user.roleName })
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  findById(@Param() params: GetProductParamsDTO, @ActiveUser() user: AccessTokenPayLoad) {
    return this.manageProductService.getDetail({
      productId: params.productId,
      userIdRequest: user.userId,
      roleNameRequest: user.roleName,
    })
  }
  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    return this.manageProductService.create(body, userId)
  }

  @Put(':productId')
  @ZodSerializerDto(ProductsResDTO)
  update(
    @Body() body: UpdateProductBodyDTO,
    @Param() params: GetProductParamsDTO,
    @ActiveUser() user: AccessTokenPayLoad,
  ) {
    return this.manageProductService.update(body, user.userId, params.productId, user.roleName)
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetProductParamsDTO, @ActiveUser() user: AccessTokenPayLoad) {
    return this.manageProductService.delete(params.productId, user.userId, user.roleName)
  }
}
