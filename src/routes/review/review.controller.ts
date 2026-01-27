import { Controller, Get, Query } from '@nestjs/common'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetReviewQueryDTO, ReviewListResponseDto } from './review.dto'
import { ReviewService } from './review.service'
import { ZodSerializerDto } from 'nestjs-zod'

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('list')
  @ZodSerializerDto(ReviewListResponseDto)
  listReview(@ActiveUser('userId') userId: number, @Query() query: GetReviewQueryDTO) {
    return this.reviewService.listReview({
      page: query.page,
      limit: query.limit,
      userId,
    })
  }
}
