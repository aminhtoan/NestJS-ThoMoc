import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { GetRoleDetailResType } from 'src/routes/role/role.model'

@Injectable()
export class SharedPermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

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
}
