import { UserStatus } from 'src/shared/constants/auth.constant'
import { REGEX } from 'src/shared/constants/regex.constant'
import z from 'zod'

const UserSchema = z.object({
  id: z.number(),
  email: z.string().regex(REGEX.email, 'Email không hợp lệ'),
  name: z.string().min(3).regex(REGEX.name, 'Tên chỉ bao gồm chữ cái, số, và khoảng trắng'),
  phoneNumber: z.string().min(10).max(15),
  password: z.string().min(6).max(50),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum(UserStatus),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  avatar: true,
  password: true,
  roleId: true,
}).strict()

export const UpdateUserBodySchema = CreateUserBodySchema.partial()

export const UserResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
  deletedAt: true,
})

export const GetUserParamsSchema = z.object({
  userId: z.coerce.number().int().positive(),
})

export const GetUserQueryResSchema = z.object({
  data: z.array(UserResponseSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetUserQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict()

export type UserType = z.infer<typeof UserSchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type UserResponseType = z.infer<typeof UserResponseSchema>
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
export type GetUserQueryResType = z.infer<typeof GetUserQueryResSchema>
export type GetUserQueryType = z.infer<typeof GetUserQuerySchema>
