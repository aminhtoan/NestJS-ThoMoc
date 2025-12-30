import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreatePermissionBodyDTO,
  CreatePermissionResDTO,
  GetPermissionDetailResDTO,
  GetPermissionParamsDTO,
  GetPermissionQueryDTO,
  GetPermissionQueryResDTO,
  UpdatePermissionBodyDTO,
} from './permission.dto'
import { PermissionService } from './permission.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodSerializerDto(GetPermissionQueryResDTO)
  list(@Query() query: GetPermissionQueryDTO) {
    return this.permissionService.list({
      page: query.page,
      limit: query.limit,
    })
  }

  @Get(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  findById(@Param() params: GetPermissionParamsDTO) {
    return this.permissionService.findById({ permissionId: params.permissionId })
  }

  @Post()
  @ZodSerializerDto(CreatePermissionResDTO)
  create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.create(body, userId)
  }

  @Put(':permissionId')
  @ZodSerializerDto(CreatePermissionResDTO)
  update(
    @Body() body: UpdatePermissionBodyDTO,
    @Param() params: GetPermissionParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.update(body, params, userId)
  }

  @Delete(':permissionId')
  @ZodSerializerDto(MessageResDto)
  delete(@Param() params: GetPermissionParamsDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.delete(params, userId)
  }
}
