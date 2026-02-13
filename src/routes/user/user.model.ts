import { UserStatus } from 'src/shared/constants/auth.constant'
import { REGEX } from 'src/shared/constants/regex.constant'
import { RoleSchema } from 'src/shared/models/shared-role.model'
import z from 'zod'
import { UserTranslationSchema } from './user-translation/user-translation.model'

const UserSchema = z.object({
  id: z.number(),
  email: z.string().regex(REGEX.email, 'Email không hợp lệ'),
  name: z.string().min(3, 'Tên phải có ít nhất 3 ký tự').regex(REGEX.name, 'Tên chỉ bao gồm chữ cái và khoảng trắng'),
  phoneNumber: z.string().regex(REGEX.phone, 'Số điện thoại phải bắt đầu bằng 0 hoặc +84 và có 10 số'),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự')
    .regex(REGEX.password, 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt'),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum(UserStatus),
  roleId: z.number().positive(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const CreateUserBodySchema = UserSchema.pick({
  email: true,
  name: true,
  phoneNumber: true,
  password: true,
  roleId: true,
  status: true,
}).strict()

export const UpdateUserBodySchema = CreateUserBodySchema.partial()

export const UserResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})
// .extend({
//   userTranslations: z.array(UserTranslationSchema).optional(),
// })

export const GetUserParamsSchema = z.object({
  userId: z.coerce.number().int().positive(),
})

export const GetProfileDetailResSchema = UserSchema.omit({
  totpSecret: true,
  password: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }),
  userTranslations: z.array(UserTranslationSchema).optional(),
})

export const GetUserQueryResSchema = z.object({
  data: z.array(GetProfileDetailResSchema),
  page: z.number(),
  limit: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
})

export const GetUserQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    search: z.string().optional(),
    status: z.enum(UserStatus).optional(),
    roleId: z.coerce.number().int().positive().optional(),
  })
  .strict()

export type UserType = z.infer<typeof UserSchema>
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>
export type UserResponseType = z.infer<typeof UserResponseSchema>
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>
export type GetUserQueryResType = z.infer<typeof GetUserQueryResSchema>
export type GetUserQueryType = z.infer<typeof GetUserQuerySchema>
