import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { RoleService } from './role.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { CreateRoleBodyDTO, GetPermissionParamsDTO, GetRoleDetailResDTO, UpdateRoleBodyDTO } from './role.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post('')
  @ZodSerializerDto(GetRoleDetailResDTO)
  async create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
    return this.roleService.create(body, userId)
  }

  @Get(':roleName')
  @ZodSerializerDto(GetRoleDetailResDTO)
  async findByName(@Param() params: GetPermissionParamsDTO) {
    return this.roleService.findByName(params)
  }

  @Put(':roleName')
  async update(
    @Body() body: UpdateRoleBodyDTO,
    @ActiveUser('userId') userId: number,
    @Param() params: GetPermissionParamsDTO,
  ) {
    return this.roleService.update(body, userId, params)
  }
}
