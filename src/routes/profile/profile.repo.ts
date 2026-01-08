import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { GetProfileDetailResType } from './profile.model'

@Injectable()
export class ProfileRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async getProfile(userId: number): Promise<GetProfileDetailResType> {
    const user = await this.prismaService.user.findFirstOrThrow({
      where: { id: userId, deletedAt: null },
      include: {
        role: {
          include: { permissions: { where: { deletedAt: null } } },
        },
      },
    })
    return user
  }
}
