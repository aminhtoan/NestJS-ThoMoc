import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { UserTranslationService } from './user-translation.service'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateUserTranslationBodyDTO,
  GetUserTranslationDetailResDTO,
  GetUserTranslationParamsDTO,
  UpdateUserTranslationBodyDTO,
} from './user-translation.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

@Controller('user-translation')
export class UserTranslationController {
  constructor(private readonly userTranslationService: UserTranslationService) {}

  @Post()
  @ZodSerializerDto(GetUserTranslationDetailResDTO)
  create(@Body() body: CreateUserTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.userTranslationService.create(body, userId)
  }

  @Get(':userTranslationId')
  @IsPublic() // Bỏ dòng này nếu muốn bắt buộc login mới xem được
  @ZodSerializerDto(GetUserTranslationDetailResDTO)
  findById(@Param() params: GetUserTranslationParamsDTO) {
    return this.userTranslationService.findById(params.userTranslationId)
  }

  @Put(':userTranslationId')
  @ZodSerializerDto(GetUserTranslationDetailResDTO)
  update(
    @Param() params: GetUserTranslationParamsDTO,
    @Body() body: UpdateUserTranslationBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.userTranslationService.update(params.userTranslationId, body, userId)
  }

  @Delete(':userTranslationId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetUserTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.userTranslationService.delete(params.userTranslationId, userId)
  }
}
