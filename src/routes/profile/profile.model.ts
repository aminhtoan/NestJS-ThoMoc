import { TypeofVerificationCode, UserStatus } from 'src/shared/constants/auth.constant'
import { REGEX } from 'src/shared/constants/regex.constant'
import z from 'zod'
import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'

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

export const GetProfileDetailResSchema = UserSchema.omit({
  totpSecret: true,
  password: true,
}).extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }).extend({
    permissions: z.array(
      PermissionSchema.pick({
        id: true,
        name: true,
        module: true,
        path: true,
        method: true,
      }),
    ),
  }),
})

export const UpdateProfileBodySchema = UserSchema.pick({
  name: true,
  phoneNumber: true,
  avatar: true,
}).partial()

export const VerifyEmailSchema = UserSchema.pick({
  email: true,
})

export const VerifyEmailCodeSchema = UserSchema.pick({
  email: true,
}).extend({
  code: z.string(),
  type: z.enum(TypeofVerificationCode),
})

export const ChangePasswordProfileSchema = z
  .object({
    oldPassword: z.string().min(6).max(50),
    confirmNewPassword: z.string().min(6).max(50),
    newPassword: z.string().min(6).max(50),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu và mật khẩu xác nhận không khớp',
        path: ['confirmNewPassword'],
      })
    }
  })

export const ChangeEmailProfileSchema = z
  .object({
    oldEmail: z.string().regex(REGEX.email, 'Email không hợp lệ'),
    newEmail: z.string().regex(REGEX.email, 'Email không hợp lệ'),
  })
  .strict()
  .superRefine(({ oldEmail, newEmail }, ctx) => {
    if (oldEmail === newEmail) {
      ctx.addIssue({
        code: 'custom',
        message: 'Vui lòng không nhập email cũ.',
        path: ['newEmail'],
      })
    }
  })

export const VerificationCodeSchema = z.object({
  type: z.enum([TypeofVerificationCode.CHANGE_EMAIL, TypeofVerificationCode.CHANGE_PASSWORD]),
})

export type UserType = z.infer<typeof UserSchema>
export type GetProfileDetailResType = z.infer<typeof GetProfileDetailResSchema>
export type UpdateProfileBodyType = z.infer<typeof UpdateProfileBodySchema>
export type VerifyEmailType = z.infer<typeof VerifyEmailSchema>
export type VerifyEmailCodeType = z.infer<typeof VerifyEmailCodeSchema>
export type ChangePasswordProfileType = z.infer<typeof ChangePasswordProfileSchema>
export type ChangeEmailProfileType = z.infer<typeof ChangeEmailProfileSchema>
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>
