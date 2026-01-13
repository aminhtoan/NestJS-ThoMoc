import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { GetUserParamsDTO, GetUserQueryDTO, GetUserQueryResDTO, UserResponseDTO } from './user.dto'
import { CreateUserBodyType, GetUserParamsType, GetUserQueryType, UpdateUserBodyType } from './user.model'
import { UserService } from './user.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ActiveRolePermission } from 'src/shared/decorators/active-role-permisson.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'

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
  update(
    @Param() params: GetUserParamsDTO,
    @Body() body: UpdateUserBodyType,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
  ) {
    return this.userService.update(params, body, userId, roleName)
  }

  @Delete(':userId')
  @ZodSerializerDto(MessageResDto)
  delete(
    @Param() params: GetUserParamsDTO,
    @ActiveUser('userId') userId: number,
    @ActiveRolePermission('name') roleName: string,
  ) {
    return this.userService.delete(params, userId, roleName)
  }

  @Get()
  @ZodSerializerDto(GetUserQueryResDTO)
  findMany(@Query() query: GetUserQueryDTO) {
    return this.userService.findMany(query)
  }

  @Get(':userId')
  @ZodSerializerDto(UserResponseDTO)
  findOne(@Param() params: GetUserParamsDTO) {
    return this.userService.findOne(params)
  }
}
