import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateUserBodyType,
  GetUserParamsType,
  GetUserQueryResType,
  GetUserQueryType,
  UpdateUserBodyType,
  UserResponseType,
} from './user.model'

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
        status: body.status,
        updatedById,
      },
    })
  }

  async update(body: UpdateUserBodyType, params: GetUserParamsType, userId: number): Promise<UserResponseType> {
    return this.prismaService.user.update({
      where: {
        id: params.userId,
        deletedAt: null,
      },
      data: {
        ...body,
        updatedById: userId,
      },
    })
  }

  async delete(params: GetUserParamsType, userId: number, hard: boolean): Promise<UserResponseType> {
    return hard
      ? this.prismaService.user.delete({
          where: { id: params.userId, deletedAt: null },
        })
      : this.prismaService.user.update({
          where: {
            id: params.userId,
            deletedAt: null,
          },
          data: {
            deletedById: userId,
            deletedAt: new Date(),
          },
        })
  }

  async findPagination({ page, limit }: GetUserQueryType): Promise<GetUserQueryResType> {
    const offset = (page - 1) * limit

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.user.findMany({
        where: {
          deletedAt: null,
        },
        skip: offset,
        take: limit,
      }),
    ])

    console.log(data)
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
