import { Injectable } from '@nestjs/common'
import { ReviewRepository } from './review.repo'

@Injectable()
export class ReviewService {
  constructor(private readonly reviewRepository: ReviewRepository) {}

  async listReview({ page, limit, userId }: { page: number; limit: number; userId: number }) {
    return await this.reviewRepository.listReview({
      page,
      limit,
      userId,
    })
  }
}
