import { createZodDto } from 'nestjs-zod'
import {
  ReviewSchema,
  ReviewMediaSchema,
  createReviewBodySchema,
  updateReviewBodySchema,
  GetReviewDetailParamsSchema,
  GetReviewsParamsSchema,
  GetReviewResSchema,
  GetDetailReviewSchema,
  GetReviewQuerySchema,
  createReviewResSchema,
} from './review.model'

export class ReviewDto extends createZodDto(ReviewSchema) {}
export class ReviewMediaDto extends createZodDto(ReviewMediaSchema) {}

export class CreateReviewBodyDto extends createZodDto(createReviewBodySchema) {}

export class UpdateReviewBodyDto extends createZodDto(updateReviewBodySchema) {}

export class GetReviewDetailParamsDto extends createZodDto(GetReviewDetailParamsSchema) {}

export class GetReviewsParamsDto extends createZodDto(GetReviewsParamsSchema) {}

export class ReviewListResponseDto extends createZodDto(GetReviewResSchema) {}

export class ReviewDetailResponseDto extends createZodDto(GetDetailReviewSchema) {}

export class GetReviewQueryDTO extends createZodDto(GetReviewQuerySchema) {}


export class GetReviewDetailDTO extends createZodDto(createReviewResSchema) {}
