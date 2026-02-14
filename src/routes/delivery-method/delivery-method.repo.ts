import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { isUniqueConstraintError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateDeliveryMethodType, UpdateDeliveryMethodType } from './delivery-method.model'

@Injectable()
export class DeliveryMethodRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateDeliveryMethodType, createdById?: number) {
    try {
      return await this.prismaService.deliveryMethod.create({
        data: {
          ...data,
          createdById,
        },
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Phương thức vận chuyển đã tồn tại')
      }
      throw error
    }
  }

  async findAll(where?: Prisma.DeliveryMethodWhereInput) {
    return await this.prismaService.deliveryMethod.findMany({
      where: {
        deletedAt: null,
        ...where,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async findById(id: number) {
    const deliveryMethod = await this.prismaService.deliveryMethod.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!deliveryMethod) {
      throw new NotFoundException('Không tìm thấy phương thức vận chuyển')
    }

    return deliveryMethod
  }

  async findByCode(code: string) {
    return await this.prismaService.deliveryMethod.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    })
  }

  async update(id: number, data: UpdateDeliveryMethodType, updatedById?: number) {
    const deliveryMethod = await this.findById(id)

    try {
      return await this.prismaService.deliveryMethod.update({
        where: { id: deliveryMethod.id },
        data: {
          ...data,
          updatedById,
        },
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Phương thức vận chuyển đã tồn tại')
      }
      throw error
    }
  }

  async delete(id: number, deletedById?: number) {
    const deliveryMethod = await this.findById(id)

    return await this.prismaService.deliveryMethod.update({
      where: { id: deliveryMethod.id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    })
  }

  async restore(id: number) {
    return await this.prismaService.deliveryMethod.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    })
  }

  async getActiveDeliveryMethods() {
    return await this.findAll({
      isActive: true,
    })
  }
}
