import { Injectable, NotFoundException } from '@nestjs/common'
import {
  CreatePermissionBodyType,
  CreatePermissionResType,
  GetPermissionDetailResType,
  GetPermissionParamType,
  GetPermissionQueryResType,
  GetPermissionQueryType,
  PermissionType,
  UpdatePermissionBodyType,
} from './permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { UserType } from 'src/shared/models/shared-user.model'

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: GetPermissionQueryType): Promise<GetPermissionQueryResType> {
    const { page, limit } = pagination
    const offset = (page - 1) * limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip: offset,
        take: limit,
      }),
    ])
    const totalPages = Math.ceil(totalItems / limit)

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages,
    }
  }

  findById(params: GetPermissionParamType): Promise<GetPermissionDetailResType> {
    return this.prismaService.permission.findUniqueOrThrow({
      where: {
        id: params.permissionId,
        deletedAt: null,
      },
    })
  }

  create(
    body: CreatePermissionBodyType & Pick<UserType, 'createdById' | 'updatedById'>,
  ): Promise<CreatePermissionResType> {
    return this.prismaService.permission.create({
      data: body,
    })
  }

  async update(
    data: UpdatePermissionBodyType & Pick<UserType, 'updatedById'>,
    id: GetPermissionParamType,
  ): Promise<CreatePermissionResType> {
    return this.prismaService.permission.update({
      where: {
        id: id.permissionId,
        deletedAt: null,
      },
      data,
    })
  }

  async delete(id: GetPermissionParamType, hard: boolean, userId: number): Promise<PermissionType> {
    return hard
      ? this.prismaService.permission.delete({
          where: {
            id: id.permissionId,
            deletedAt: null,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id: id.permissionId,
            deletedAt: null,
          },
          data: {
            deletedById: userId,
            deletedAt: new Date(),
          },
        })
  }
}
