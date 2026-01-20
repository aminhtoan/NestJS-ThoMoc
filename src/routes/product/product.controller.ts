import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ProductService } from './product.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import {
  CreateProductBodyDTO,
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

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetProductsResDTO)
  list(@Query() query: GetProductsQueryDTO) {
    return this.productService.getProducts(query)
  }

  @Get(':productId')
  @IsPublic()
  @ZodSerializerDto(GetProductDetailResDTO)
  findById(@Param() params: GetProductParamsDTO) {
    return this.productService.findById(params.productId)
  }
  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    return this.productService.create(body, userId)
  }

  @Put(':productId')
  @ZodSerializerDto(ProductsResDTO)
  update(
    @Body() body: UpdateProductBodyDTO,
    @Param() params: GetProductParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productService.update(body, userId, params.productId)
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetProductParamsDTO, @ActiveUser('userId') userId: number) {
    return this.productService.delete(params.productId, userId)
  }
}
