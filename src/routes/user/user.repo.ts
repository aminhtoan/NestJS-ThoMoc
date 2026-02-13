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
import { Prisma, UserStatus } from '@prisma/client'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(body: CreateUserBodyType, createdById: number): Promise<UserResponseType> {
    return this.prismaService.user.create({
      data: {
        email: body.email,
        name: body.name,
        phoneNumber: body.phoneNumber,
        password: body.password,
        roleId: body.roleId,
        status: body.status,
        createdById,
      },
      omit: {
        password: true,
        totpSecret: true,
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

  async findPagination(query: GetUserQueryType, languageId: string): Promise<GetUserQueryResType> {
    const { page, limit, search, status, roleId } = query
    const offset = (page - 1) * limit

    // Xây dựng điều kiện where chung
    const whereCondition: Prisma.UserWhereInput = {
      deletedAt: null,
    }

    // Thêm status filter
    if (status !== undefined) {
      whereCondition.status = status
    }

    // Thêm roleId filter
    if (roleId) {
      whereCondition.roleId = roleId
    }

    // Xử lý search
    if (search) {
      const searchConditions: Prisma.UserWhereInput[] = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
        { role: { name: { contains: search, mode: 'insensitive' } } },
      ]

      // Kiểm tra nếu search là status
      const upperSearch = search.toUpperCase()
      const statusKeywords = ['ACTIVE', 'INACTIVE', 'BLOCKED']

      // Tìm status có chứa search text
      const matchedStatus = statusKeywords.find((status) => status.includes(upperSearch))

      if (matchedStatus) {
        searchConditions.push({ status: matchedStatus as UserStatus })
      }

      whereCondition.OR = searchConditions
    }

    // Chạy đồng thời count và findMany với CÙNG điều kiện where
    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where: whereCondition,
      }),
      this.prismaService.user.findMany({
        where: whereCondition,
        skip: offset,
        take: limit,
        include: {
          role: true,
          userTranslations: {
            where: languageId ? { deletedAt: null, languageId } : { deletedAt: null },
          },
        },
        orderBy: {
          createdAt: 'asc', // Thêm sắp xếp
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
