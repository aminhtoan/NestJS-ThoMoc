import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateUserBodyType, GetUserParamsType, UpdateUserBodyType, UserResponseType } from './user.model'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(body: CreateUserBodyType, updatedById: number): Promise<UserResponseType> {
    return this.prismaService.user.create({
      data: {
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: body.password,
        roleId: body.roleId,
        updatedById,
      },
    })
  }

  async update(body: UpdateUserBodyType, params: GetUserParamsType, userId: number) {
    return this.prismaService.user.update({
      where: {
        id: params.userId,
      },
      data: {
        ...body,
        updatedById: userId,
      },
    })
  }
}
