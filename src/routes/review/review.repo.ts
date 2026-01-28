import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import {
  createReviewBodyType,
  createReviewResType,
  GetDetailReviewType,
  GetReviewDetailParamsType,
  GetReviewResSchemaType,
  GetReviewsParamsType,
  ReviewType,
  updateReviewBodyType,
} from './review.model'
import { ORDER_STATUS } from 'src/shared/constants/order.constant'

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async listReview({
    page,
    limit,
    productId,
  }: {
    page: number
    limit: number
    productId: number
  }): Promise<GetReviewResSchemaType> {
    const offet = (page - 1) * limit

    const [data, totalItems] = await Promise.all([
      this.prismaService.review.findMany({
        where: {
          productId,
        },
        include: {
          medias: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offet,
      }),
      this.prismaService.review.count({
        where: {
          productId,
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

  async getReviewDetail({
    reviewId,
    userId,
    productId,
  }: {
    reviewId: number
    userId: number
    productId: number
  }): Promise<GetDetailReviewType> {
    return await this.prismaService.review.findUnique({
      where: {
        id: reviewId,
        userId,
        productId,
      },
      include: {
        product: true,
        medias: true,
      },
    })
  }

  async createReview(body: createReviewBodyType, userId: number): Promise<ReviewType> {
    const { orderId, productId, medias, ...reviewData } = body

    const orderItem = await this.prismaService.order.findFirst({
      where: {
        id: orderId,
        userId,
        items: {
          some: {
            productId,
          },
        },
      },
    })

    if (!orderItem) {
      throw new BadRequestException('Bạn chưa mua sản phẩm này')
    }

    if (orderItem.status !== ORDER_STATUS.DELIVERED) {
      throw new BadRequestException('Đơn hàng chưa được giao hàng')
    }

    const existedReview = await this.prismaService.review.findUnique({
      where: {
        orderId_productId: {
          productId,
          orderId,
        },
      },
    })

    if (existedReview) {
      throw new BadRequestException('Sản phẩm này đã được đánh giá')
    }

    const review = await this.prismaService.review.create({
      data: {
        content: reviewData.content,
        rating: reviewData.rating,
        orderId,
        productId,
        userId,
        medias: {
          create: medias,
        },
      },
      include: {
        product: true,
        medias: true,
      },
    })

    return review
  }

  async updateReview(body: updateReviewBodyType, userId: number, reviewId: number) {
    const { medias, ...reviewData } = body

    const review = await this.prismaService.review.findFirst({
      where: {
        id: reviewId,
        userId,
      },
    })

    if (!review) {
      throw new BadRequestException('Không tìm thấy đánh giá')
    }

    if (review.updateCount >= 1) {
      throw new BadRequestException('Đánh giá chỉ được chỉnh sửa 1 lần')
    }

    return await this.prismaService.review.update({
      where: {
        id: reviewId,
      },
      data: {
        content: body.content,
        rating: body.rating,
        updateCount: {
          increment: 1,
        },
        medias: body.medias
          ? {
              create: body.medias.add,
              deleteMany: body.medias.removeIds ? { id: { in: body.medias.removeIds } } : undefined,
            }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })
  }
}
