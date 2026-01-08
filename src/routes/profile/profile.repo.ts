import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ChangePasswordProfileType, GetProfileDetailResType, UpdateProfileBodyType, VerifyEmailCodeType } from './profile.model'

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

  async updateProfile(userId: number, body: UpdateProfileBodyType) {
    return await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...body,
        updatedById: userId,
      },
    })
  }

  async verifyEmail(userId: number) {
    return this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    })
  }

  async changePassword(body: ChangePasswordProfileType, userId: number) {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: body.newPassword,
      },
    })
  }
}
