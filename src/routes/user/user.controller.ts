import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { UserService } from './user.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateUserBodyDTO, GetUserQueryResDTO, UserResponseDTO } from './user.dto'
import { CreateUserBodyType, GetUserParamsType, GetUserQueryType, UpdateUserBodyType } from './user.model'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ZodSerializerDto(UserResponseDTO)
  create(@Param() params: GetUserParamsType, @ActiveUser('userId') userId: number) {}

  @Patch(':userId')
  @ZodSerializerDto(UserResponseDTO)
  update(@Param() params: GetUserParamsType, @Body() body: UpdateUserBodyType) {}

  @Delete(':userId')
  delete(@Param() params: GetUserParamsType) {}

  @Get()
  @ZodSerializerDto(GetUserQueryResDTO)
  findMany(@Query() query: GetUserQueryType) {}

  @Get(':userId')
  @ZodSerializerDto(UserResponseDTO)
  findOne(@Param() params: GetUserParamsType) {}
}
