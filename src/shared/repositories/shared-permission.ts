import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { GetRoleDetailResType } from 'src/routes/role/role.model'

@Injectable()
export class SharedPermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: number): Promise<any> {
    return await this.prismaService.permission.findUniqueOrThrow({
      where: {
        id: id,
        deletedAt: null,
      },
    })
  }
}
