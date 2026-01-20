import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ProductTranslationService } from './product-translation.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodyDTO,
  GetProductTranslationDetailResDTO,
  GetProductTranslationParamsDTO,
  UpdateProductTranslationBodyDTO,
} from './product-translation.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator' // Decorator lấy user từ token
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator' // Tùy chọn nếu cần public API get

@Controller('product-translation')
export class ProductTranslationController {
  constructor(private readonly productTranslationService: ProductTranslationService) {}

  @Post()
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  create(@Body() body: CreateProductTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.create(body, userId)
  }

  @Get(':productTranslationId')
  @IsPublic()
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  findById(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.findById(params.productTranslationId)
  }

  @Put(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  update(
    @Param() params: GetProductTranslationParamsDTO,
    @Body() body: UpdateProductTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.update(params.productTranslationId, body, userId)
  }

  @Delete(':productTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetProductTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.delete(params.productTranslationId, userId)
  }
}
