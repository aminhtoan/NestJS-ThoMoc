import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import {
  CreateTranslationDTO,
  GetBrandTranslationParamsDTO,
  GetBrandTranslationQueryDTO,
  GetBrandTranslationQueryResDTO,
  ResponeBrandTranslationDTO,
  UpdateBrandTranslationDTO,
} from './brand-translation.dto'
import { BrandTranslationService } from './brand-translation.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('brand-translation')
export class BrandTranslationController {
  constructor(private readonly brandTranslationService: BrandTranslationService) {}

  @Post('')
  @ZodSerializerDto(ResponeBrandTranslationDTO)
  create(@Body() body: CreateTranslationDTO, @ActiveUser('userId') userId: number) {
    return this.brandTranslationService.create(body, userId)
  }

  @Put(':brandTranslationId')
  @ZodSerializerDto(ResponeBrandTranslationDTO)
  update(
    @Body() body: UpdateBrandTranslationDTO,
    @Param() params: GetBrandTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandTranslationService.update(body, params, userId)
  }

  @Delete(':brandTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetBrandTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandTranslationService.delete(params, userId)
  }

  @Get(':brandTranslationId')
  @ZodSerializerDto(ResponeBrandTranslationDTO)
  findById(@Param() params: GetBrandTranslationParamsDTO) {
    return this.brandTranslationService.findById(params)
  }

  @Get('')
  @ZodSerializerDto(GetBrandTranslationQueryResDTO)
  list(@Query() query: GetBrandTranslationQueryDTO) {
    return this.brandTranslationService.list(query)
  }
}
