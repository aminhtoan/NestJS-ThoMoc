import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CategoryService } from './category.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCategoryBodyDto,
  GetAllCategoriesQueryDTO,
  GetAllCategoriesResDto,
  GetCategoryDetailResDto,
  GetCategoryParamsDto,
  UpdateCategoryBodyDto,
} from './category.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetAllCategoriesResDto)
  findAll(@Query() query: GetAllCategoriesQueryDTO) {
    return this.categoryService.findAll(query.parentCategoryId)
  }

  @Get(':categoryId')
  @IsPublic()
  @ZodSerializerDto(GetCategoryDetailResDto)
  findById(@Param() params: GetCategoryParamsDto) {
    return this.categoryService.findById(params.categoryId)
  }

  @Post()
  @ZodSerializerDto(GetCategoryDetailResDto)
  create(@Body() body: CreateCategoryBodyDto, @ActiveUser('userId') userId: number) {
    return this.categoryService.create(body, userId)
  }

  @Put(':categoryId')
  @ZodSerializerDto(GetCategoryDetailResDto)
  update(
    @Param() params: GetCategoryParamsDto,
    @Body() body: UpdateCategoryBodyDto,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.update({
      id: params.categoryId,
      data: body,
      updatedById: userId,
    })
  }

  @Delete(':categoryId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetCategoryParamsDto, @ActiveUser('userId') userId: number) {
    return this.categoryService.delete({
      id: params.categoryId,
      deletedById: userId,
    })
  }
}
