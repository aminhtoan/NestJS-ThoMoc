import { Injectable, NotFoundException } from '@nestjs/common'
import { ReviewRepository } from './review.repo'
import { createReviewBodyType, updateReviewBodyType } from './review.model'

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async listReview({ page, limit, productId }: { page: number; limit: number; productId: number }) {
    return await this.reviewRepository.listReview({
      page,
      limit,
      productId,
    })
  }

  async getReviewDetail({ reviewId, userId, productId }: { reviewId: number; userId: number; productId: number }) {
    try {
      return await this.reviewRepository.getReviewDetail({
        reviewId,
        userId,
        productId,
      })
    } catch (error) {
      throw new NotFoundException('Không tìm thấy đánh giá')
    }
  }

  async createReview(body: createReviewBodyType, userId: number) {
    return await this.reviewRepository.createReview(body, userId)
  }

  async updateReview(body: updateReviewBodyType, userId: number, reviewId: number) {
    return await this.reviewRepository.updateReview(body, userId, reviewId)
  }
}
