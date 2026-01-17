import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { BrandService } from './brand.service'
import {
  CreateBrandBodyDTO,
  GetBrandDetailResDTO,
  GetBrandParamsDTO,
  GetBrandQueryDTO,
  GetBrandQueryResDTO,
  UpdateBrandBodyDTO,
} from './brand.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post('')
  @ZodSerializerDto(GetBrandDetailResDTO)
  create(@Body() body: CreateBrandBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.create(body, userId)
  }

  @Put(':brandId')
  @ZodSerializerDto(GetBrandDetailResDTO)
  update(@Body() body: UpdateBrandBodyDTO, @ActiveUser('userId') userId: number, @Param() params: GetBrandParamsDTO) {
    return this.brandService.update(params, body, userId)
  }

  @Delete(':brandId')
  @ZodSerializerDto(MessageResDto)
  delete(@ActiveUser('userId') userId: number, @Param() params: GetBrandParamsDTO) {
    return this.brandService.delete(userId, params)
  }

  @Get(':brandId')
  @ZodSerializerDto(GetBrandDetailResDTO)
  findById(@Param() params: GetBrandParamsDTO) {
    return this.brandService.findById(params)
  }

  @Get('')
  @ZodSerializerDto(GetBrandQueryResDTO)
  list(@Query() query: GetBrandQueryDTO) {
    return this.brandService.list(query)
  }
}
