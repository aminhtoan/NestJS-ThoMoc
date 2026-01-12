import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetUserQueryResDTO, UserResponseDTO } from './user.dto'
import { CreateUserBodyType, GetUserParamsType, GetUserQueryType, UpdateUserBodyType } from './user.model'
import { UserService } from './user.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermission } from 'src/shared/decorators/active-role-permisson.decorator'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ZodSerializerDto(UserResponseDTO)
  create(
    @Body() body: CreateUserBodyType,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
  ) {
    return this.userService.create(body, userId, roleName)
  }

  @Patch(':userId')
  @ZodSerializerDto(UserResponseDTO)
  update(@Param() params: GetUserParamsType, @Body() body: UpdateUserBodyType, @ActiveUser('userId') userId: number) {
    return this.userService.update(params, body, userId)
  }

  @Delete(':userId')
  delete(@Param() params: GetUserParamsType) {}

  @Get()
  @ZodSerializerDto(GetUserQueryResDTO)
  findMany(@Query() query: GetUserQueryType) {}

  @Get(':userId')
  @ZodSerializerDto(UserResponseDTO)
  findOne(@Param() params: GetUserParamsType) {}
}
