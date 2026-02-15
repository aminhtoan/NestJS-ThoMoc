import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { isUniqueConstraintError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateDeliveryMethodType,
  DeliveryMethodType,
  GetDeliveryMethodQueryPaginationType,
  UpdateDeliveryMethodType,
} from './delivery-method.model'

@Injectable()
export class DeliveryMethodRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateDeliveryMethodType, createdById?: number): Promise<DeliveryMethodType> {
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

  async findAll(query: GetDeliveryMethodQueryPaginationType, where?: Prisma.DeliveryMethodWhereInput) {
    const ofset = (query.page - 1) * query.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.deliveryMethod.count({}),
      this.prismaService.deliveryMethod.findMany({
        where: {
          // deletedAt: null,
          ...where,
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip: ofset,
        take: query.limit,
      }),
    ])
    const totalPages = Math.ceil(totalItems / query.limit)

    return {
      data,
      page: query.page,
      limit: query.limit,
      totalItems,
      totalPages,
    }
  }

  async findById(id: number): Promise<DeliveryMethodType> {
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

  async update(id: number, data: UpdateDeliveryMethodType, updatedById?: number): Promise<DeliveryMethodType> {
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

  async delete(id: number, deletedById?: number): Promise<DeliveryMethodType> {
    const deliveryMethod = await this.findById(id)

    return await this.prismaService.deliveryMethod.update({
      where: { id: deliveryMethod.id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    })
  }

  async restore(id: number): Promise<DeliveryMethodType> {
    return await this.prismaService.deliveryMethod.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    })
  }

  async getActiveDeliveryMethods() {
    return await this.findAll(
      {
        page: 1,
        limit: 100,
      },
      {
        isActive: true,
        deletedAt: null,
      },
    )
  }
}
