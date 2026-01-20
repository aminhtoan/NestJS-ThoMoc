import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  CreateProductTranslationBodyType,
  ProductTranslation,
  UpdateProductTranslationBodyType,
} from './product-translation.model'

@Injectable()
export class ProductTranslationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateProductTranslationBodyType, createdById: number): Promise<ProductTranslation> {
    return await this.prismaService.productTranslation.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  async findById(id: number): Promise<ProductTranslation | null> {
    return await this.prismaService.productTranslation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  async update(id: number, data: UpdateProductTranslationBodyType, updatedById: number): Promise<ProductTranslation> {
    return await this.prismaService.productTranslation.update({
      where: { id, deletedAt: null },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  async delete(id: number, deletedById: number): Promise<ProductTranslation> {
    return await this.prismaService.productTranslation.update({
      where: { id, deletedAt: null },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    })
  }
}
