import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { GetReviewResSchemaType } from './review.model'

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listReview({
    page,
    limit,
    userId,
  }: {
    page: number
    limit: number
    userId: number
  }): Promise<GetReviewResSchemaType> {
    const offet = (page - 1) * limit

    const [data, totalItems] = await Promise.all([
      this.prismaService.review.findMany({
        where: {
          userId,
        },
        include: {
          product: true,
          medias: true,
        },
        take: limit,
        skip: offet,
      }),
      this.prismaService.review.count({
        where: {
          userId,
        },
      }),
    ])

    return {
      data,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
}
