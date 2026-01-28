import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import {
  CreateReviewBodyDto,
  GetReviewDetailDTO,
  GetReviewDetailParamsDto,
  GetReviewQueryDTO,
  GetReviewsParamsDto,
  ReviewDto,
  ReviewListResponseDto,
  UpdateReviewBodyDto,
} from './review.dto'
import { ReviewService } from './review.service'

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('/product/:productId')
  @IsPublic()
  @ZodSerializerDto(ReviewListResponseDto)
  listReview(@Param() params: GetReviewDetailParamsDto, @Query() query: GetReviewQueryDTO) {
    return this.reviewService.listReview({
      page: query.page,
      limit: query.limit,
      productId: params.productId,
    })
  }

  @Get('detail/review/:reviewId/product/:productId')
  @ZodSerializerDto(GetReviewDetailDTO)
  reviewDetail(
    @ActiveUser('userId') userId: number,
    @Param() reviewId: GetReviewsParamsDto,
    @Param() productId: GetReviewDetailParamsDto,
  ) {
    return this.reviewService.getReviewDetail({
      reviewId: reviewId.reviewId,
      userId,
      productId: productId.productId,
    })
  }

  @Post()
  @ZodSerializerDto(ReviewDto)
  createReview(@ActiveUser('userId') userId: number, @Body() body: CreateReviewBodyDto) {
    return this.reviewService.createReview(body, userId)
  }

  @Put(':reviewId')
  @ZodSerializerDto(ReviewDto)
  updateReview(
    @ActiveUser('userId') userId: number,
    @Param() params: GetReviewsParamsDto,
    @Body() body: UpdateReviewBodyDto,
  ) {
    return this.reviewService.updateReview(body, userId, params.reviewId)
  }
}
