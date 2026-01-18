import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { CategoryTranslationService } from './category-translation.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCategoryTranslationBodyDTO,
  GetCategoryTranslationDetailResDTO,
  GetCategoryTranslationParamsDTO,
  UpdateCategoryTranslationBodyDTO,
} from './category-translation.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('category-translation')
export class CategoryTranslationController {
  constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

  @Post()
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  create(@Body() body: CreateCategoryTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.create(body, userId)
  }

  @Put(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  update(
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
    @Param() params: GetCategoryTranslationParamsDTO,
  ) {
    return this.categoryTranslationService.update(body, userId, params.categoryTranslationId)
  }

  @Delete(':categoryTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@ActiveUser('userId') userId: number, @Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.delete(userId, params.categoryTranslationId)
  }

  @Get(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.findById(params.categoryTranslationId)
  }
}
