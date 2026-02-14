import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { isUniqueConstraintError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreatePaymentMethodType, UpdatePaymentMethodType } from './payment.model'

@Injectable()
export class PaymentMethodRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreatePaymentMethodType, createdById?: number) {
    try {
      return await this.prismaService.paymentMethod.create({
        data: {
          ...data,
          createdById,
        },
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Phương thức thanh toán đã tồn tại')
      }
      throw error
    }
  }

  async findAll(where?: Prisma.PaymentMethodWhereInput) {
    return await this.prismaService.paymentMethod.findMany({
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
    const paymentMethod = await this.prismaService.paymentMethod.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!paymentMethod) {
      throw new NotFoundException('Không tìm thấy phương thức thanh toán')
    }

    return paymentMethod
  }

  async findByCode(code: string) {
    return await this.prismaService.paymentMethod.findFirst({
      where: {
        code,
        deletedAt: null,
      },
    })
  }

  async update(id: number, data: UpdatePaymentMethodType, updatedById?: number) {
    const paymentMethod = await this.findById(id)

    try {
      return await this.prismaService.paymentMethod.update({
        where: { id: paymentMethod.id },
        data: {
          ...data,
          updatedById,
        },
      })
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Phương thức thanh toán đã tồn tại')
      }
      throw error
    }
  }

  async delete(id: number, deletedById?: number) {
    const paymentMethod = await this.findById(id)

    return await this.prismaService.paymentMethod.update({
      where: { id: paymentMethod.id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    })
  }

  async restore(id: number) {
    return await this.prismaService.paymentMethod.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    })
  }

  async getActivePaymentMethods() {
    return await this.findAll({
      isActive: true,
    })
  }
}
