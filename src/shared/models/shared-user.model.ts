import { GetRoleDetailResSchema, RoleType } from './shared-role.model'
import z from 'zod'
import { TypeofVerificationCode, UserStatus } from '../constants/auth.constant'
import { REGEX } from '../constants/regex.constant'

export const UserSchema = z.object({
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

export const VerificationCode = z.object({
  id: z.number(),
  email: z.string(),
  code: z.string(),
  type: z.enum(TypeofVerificationCode),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export const UserWithRoleSchema = UserSchema.extend({
  role: GetRoleDetailResSchema,
})

export type UserType = z.infer<typeof UserSchema>
export type VerificationCodeType = z.infer<typeof VerificationCode>
export type UserWithRoleType = z.infer<typeof UserWithRoleSchema>
