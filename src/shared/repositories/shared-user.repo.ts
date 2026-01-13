import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'
import { UserType, UserWithRoleType, VerificationCodeType } from '../models/shared-user.model'
import { TypeofVerificationCodeType } from '../constants/auth.constant'

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUnique(uniqueObject: { email: string } | { id: number }): Promise<UserWithRoleType | null> {
    return this.prismaService.user.findUniqueOrThrow({
      where: uniqueObject,
      include: {
        role: {
          include: {
            permissions: true,
          },
        },
      },
    })
  }

  async createVerification(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return this.prismaService.verificationCode.upsert({
      where: {
        email_code_type: {
          email: payload.email,
          code: payload.code,
          type: payload.type,
        },
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
        type: payload.type,
      },
    })
  }

  async findUniqueVerificationCode(
    uniqueValue:
      | { id: number }
      | { email_code_type: { email: string; code: string; type: TypeofVerificationCodeType } },
  ): Promise<VerificationCodeType | null> {
    return this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    })
  }
}
