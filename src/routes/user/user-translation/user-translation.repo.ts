import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateUserTranslationBodyType, UpdateUserTranslationBodyType, UserTranslation } from './user-translation.model'

@Injectable()
export class UserTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateUserTranslationBodyType, createdById: number): Promise<UserTranslation> {
    return await this.prismaService.userTranslation.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  async findById(id: number): Promise<UserTranslation | null> {
    return await this.prismaService.userTranslation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  async update(id: number, data: UpdateUserTranslationBodyType, updatedById: number): Promise<UserTranslation> {
    return await this.prismaService.userTranslation.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  async delete(id: number, deletedById: number): Promise<UserTranslation> {
    // Soft delete: Cập nhật deletedAt thay vì xóa vĩnh viễn
    return await this.prismaService.userTranslation.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    })
  }
}
