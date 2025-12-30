import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import {
  CreateLanguageBodyDTO,
  GetAllLanguagesResDTO,
  GetLanguageParamsDTO,
  GetLanguageResDTO,
  UpdateLanguageBodyDTO,
} from './languages.dto'
import { LanguagesService } from './languages.service'

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languages: LanguagesService) {}

  @Get('')
  @ZodSerializerDto(GetAllLanguagesResDTO)
  getAllLanguages() {
    return this.languages.getAllLanguages()
  }

  @Get(':languageId')
  @ZodSerializerDto(GetLanguageResDTO)
  getLanguagesById(@Param() param: GetLanguageParamsDTO) {
    return this.languages.getLanguagesById(param.languageId)
  }

  @Post('')
  @ZodSerializerDto(GetLanguageResDTO)
  createLanguages(@Body() body: CreateLanguageBodyDTO, @ActiveUser('userId') userId: number) {
    return this.languages.create(body, userId)
  }

  @Delete(':languageId')
  @ZodSerializerDto(MessageResDto)
  deleteById(@Param() param: GetLanguageParamsDTO, @ActiveUser('userId') userId: number) {
    return this.languages.delete(param.languageId, userId)
  }

  @Put(':languageId')
  @ZodSerializerDto(MessageResDto)
  update(
    @Param() param: GetLanguageParamsDTO,
    @Body() body: UpdateLanguageBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.languages.update(param.languageId, body, userId)
  }
}
