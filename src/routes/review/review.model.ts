import { ProductSchema } from 'src/shared/models/shared-product.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import z from 'zod'

export const ReviewSchema = z.object({
  id: z.number().int(),
  content: z.string().min(1).max(500),
  rating: z.number().int().min(1).max(5),
  orderId: z.number().int(),
  productId: z.number().int(),
  userId: z.number().int(),
  updateCount: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const ReviewMediaSchema = z.object({
  id: z.number().int(),
  reviewId: z.number().int(),
  url: z.string(),
  type: z.enum(['IMAGE', 'VIDEO']),
  createdAt: z.date(),
})

export const createReviewBodySchema = ReviewSchema.pick({
  content: true,
  rating: true,
  orderId: true,
  productId: true,
}).extend({
  medias: z.array(
    ReviewMediaSchema.pick({
      url: true,
      type: true,
    }),
  ),
})

export const createReviewResSchema = ReviewSchema.extend({
  medias: z.array(ReviewMediaSchema),
})

export const updateReviewBodySchema = z
  .object({
    content: z.string().min(1).max(255).optional(),
    rating: z.number().int().min(1).max(5).optional(),

    medias: z
      .object({
        add: z
          .array(
            ReviewMediaSchema.pick({
              url: true,
              type: true,
            }),
          )
          .optional(),

        removeIds: z.array(z.number().int()).optional(),
      })
      .optional(),
  })
  .strict()
  .refine((data) => data.content !== undefined || data.rating !== undefined || data.medias !== undefined, {
    message: 'Phải cập nhật ít nhất content, rating hoặc medias',
  })

export const GetReviewDetailParamsSchema = z.object({
  productId: z.coerce.number().int().positive(),
})

export const GetReviewsParamsSchema = z.object({
  reviewId: z.coerce.number().int().positive(),
})

export const ReviewMediaListSchema = ReviewMediaSchema.pick({
  id: true,
  url: true,
})

export const ReviewListItemSchema = ReviewSchema.extend({
  medias: z.array(ReviewMediaListSchema),
  user: UserSchema.pick({
    id: true,
    name: true,
    avatar: true,
  }),
})

export const GetReviewQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export const GetReviewResSchema = z.object({
  data: z.array(ReviewListItemSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetDetailReviewSchema = ReviewSchema.extend({
  product: ProductSchema,
})

export type ReviewType = z.infer<typeof ReviewSchema>
export type ReviewMediaListType = z.infer<typeof ReviewMediaListSchema>
export type ReviewListItemType = z.infer<typeof ReviewListItemSchema>
export type GetReviewResSchemaType = z.infer<typeof GetReviewResSchema>
export type GetDetailReviewType = z.infer<typeof GetDetailReviewSchema>
export type createReviewBodyType = z.infer<typeof createReviewBodySchema>
export type updateReviewBodyType = z.infer<typeof updateReviewBodySchema>
export type GetReviewDetailParamsType = z.infer<typeof GetReviewDetailParamsSchema>
export type GetReviewsParamsType = z.infer<typeof GetReviewsParamsSchema>
export type ReviewMedia = z.infer<typeof ReviewMediaSchema>
export type ReviewMediaList = z.infer<typeof ReviewMediaListSchema>
export type ReviewListItem = z.infer<typeof ReviewListItemSchema>
export type createReviewBody = z.infer<typeof createReviewBodySchema>
export type updateReviewBody = z.infer<typeof updateReviewBodySchema>
export type GetReviewDetailParams = z.infer<typeof GetReviewDetailParamsSchema>
export type GetReviewsParams = z.infer<typeof GetReviewsParamsSchema>
export type createReviewResType = z.infer<typeof createReviewResSchema>
