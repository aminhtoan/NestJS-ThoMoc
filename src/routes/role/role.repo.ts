import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateRoleBodyType,
  GetRoleParamsType,
  GetRoleDetailResType,
  RoleType,
  UpdateRoleBodyType,
  GetRoleQueryType,
  GetRoleQueryResType,
} from './role.model'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    body: CreateRoleBodyType & Pick<RoleType, 'createdById' | 'updatedById'>,
  ): Promise<GetRoleDetailResType> {
    return this.prismaService.role.create({
      data: body,
      include: {
        permissions: true,
      },
    })
  }

  async findByName(roleName: string): Promise<GetRoleDetailResType> {
    return await this.prismaService.role.findUnique({
      where: {
        name: roleName,
      },
      include: {
        permissions: true,
      },
    })
  }

  async findById(roleId: number): Promise<GetRoleDetailResType> {
    return await this.prismaService.role.findUniqueOrThrow({
      where: {
        id: roleId,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })
  }

  async update(
    data: UpdateRoleBodyType & Pick<RoleType, 'updatedById'>,
    params: GetRoleParamsType,
  ): Promise<GetRoleDetailResType> {
    // If isActive is being set to false, set the deletedAt timestamp and deletion info

    const updatePayload: any = {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      updatedById: data.updatedById,
    }

    // If isActive is being set to true, clear the deletedAt timestamp
    if (data.isActive === true) {
      updatePayload.deletedAt = null
    }

    if (data.isActive === false) {
      updatePayload.deletedAt = new Date()
      updatePayload.deletedById = data.updatedById
    }

    if ('permissionIds' in data && data.permissionIds !== undefined) {
      if (data.permissionIds.length > 0) {
        updatePayload.permissions = {
          set: data.permissionIds.map((id) => ({ id })),
        }
      }
    }
    return this.prismaService.role.update({
      where: {
        id: params.roleId,
      },
      data: updatePayload,
      include: {
        permissions: true,
      },
    })
  }

  normalizeRoleName = (name: string) => name.toUpperCase().trim()

  async delete(userId: number, params: GetRoleParamsType, hard: boolean): Promise<RoleType> {
    return hard
      ? this.prismaService.role.delete({
          where: {
            id: params.roleId,
          },
        })
      : this.prismaService.role.update({
          where: {
            id: params.roleId,
            deletedAt: null,
          },
          data: {
            deletedById: userId,
            updatedById: userId,
            deletedAt: new Date(),
            isActive: false,
          },
        })
  }

  async list({ page, limit }: GetRoleQueryType): Promise<GetRoleQueryResType> {
    const offset = (page - 1) * limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),

      this.prismaService.role.findMany({
        where: {
          deletedAt: null,
        },
        skip: offset,
        take: limit,
        include: {
          permissions: {
            where: {
              deletedAt: null,
            },
          },
        },
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
}
