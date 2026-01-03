import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateRoleBodyType, GetRoleParamsType, GetRoleDetailResType, RoleType, UpdateRoleBodyType } from './role.model'
import { Injectable } from '@nestjs/common'

@Injectable()
export class RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    body: CreateRoleBodyType & Pick<RoleType, 'createdById' | 'updatedById'>,
  ): Promise<GetRoleDetailResType> {
    return this.prismaService.role.create({
      data: body,
    })
  }

  async findByName(roleName: string): Promise<GetRoleDetailResType> {
    return await this.prismaService.role.findUnique({
      where: {
        name: roleName,
      },
    })
  }

  async findById(roleId: number): Promise<GetRoleDetailResType> {
    return await this.prismaService.role.findUniqueOrThrow({
      where: {
        id: roleId,
      },
    })
  }

  async update(
    data: UpdateRoleBodyType & Pick<RoleType, 'updatedById'>,
    params: GetRoleParamsType,
  ): Promise<GetRoleDetailResType> {
    return this.prismaService.role.update({
      where: {
        id: params.roleId,
        deletedAt: null,
      },
      data,
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
}
