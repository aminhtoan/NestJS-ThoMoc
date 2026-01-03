import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { RoleService } from './role.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateRoleBodyDTO, GetPermissionParamsDTO, GetRoleDetailResDTO, UpdateRoleBodyDTO } from './role.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('')
  @ZodSerializerDto(GetRoleDetailResDTO)
  async create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.create(body, userId)
  }

  @Get(':roleId')
  @ZodSerializerDto(GetRoleDetailResDTO)
  async findById(@Param() params: GetPermissionParamsDTO) {
    return this.roleService.findById(params)
  }

  @Put(':roleId')
  @ZodSerializerDto(MessageResDto)
  async update(
    @Body() body: UpdateRoleBodyDTO,
    @ActiveUser('userId') userId: number,
    @Param() params: GetPermissionParamsDTO,
  ) {
    return this.roleService.update(body, userId, params)
  }

  @Delete(':roleId')
  @ZodSerializerDto(MessageResDto)
  delete(@ActiveUser('userId') userId: number, @Param() params: GetPermissionParamsDTO) {
    return this.roleService.delete(userId, params)
  }
}
