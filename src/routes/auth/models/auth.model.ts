import { TypeofVerificationCode, UserStatus } from 'src/shared/constants/auth.constant'
import { REGEX } from 'src/shared/constants/regex.constant'
import { z } from 'zod'

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
// register
export const ResgisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(50),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const ResgisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

// Send OTP
export const VerificationCode = z.object({
  id: z.number(),
  email: z.string(),
  code: z.string(),
  type: z.enum(TypeofVerificationCode),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
})

export const SendOTPBodySchema = VerificationCode.pick({
  email: true,
  type: true,
}).strict()

// Login

export const VerifyLoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export const LoginBodySchema = z
  .object({
    tempToken: z.string().regex(REGEX.uuid, 'tempToken không hợp lệ'),
  })
  .extend({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        path: ['code'],
        message: 'Cung cấp mã 2FA hoặc mã OTP',
        code: 'custom',
      })
      ctx.addIssue({
        path: ['totpCode'],
        message: 'Cung cấp 2FA PCode hoặc OTP',
        code: 'custom',
      })
    }
  })

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export const RefreshTokenResSchema = LoginResSchema

//device
export const DeiviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.coerce.date(),
  createdAt: z.coerce.date(),
  isActive: z.boolean(),
})

// RefreshToken
export const RefreshTokenSchema = z.object({
  token: z.string().max(1000),
  userId: z.number().int(),
  deviceId: z.number().int(),
  expiresAt: z.date(),
  createdAt: z.date(),
})

// role
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  updatedAt: z.coerce.date(),
})

export const LogoutBodySchema = RefreshTokenBodySchema

// google auth 2
export const GoogleAuthStateSchema = DeiviceSchema.pick({
  ip: true,
  userAgent: true,
})

export const GetAuthorizationUrlResSchema = z.object({
  url: z.string().url(),
})

export const ForgotPasswordBodySchema = UserSchema.pick({
  email: true,
})

export const VerifyResetCodeBodySchema = UserSchema.pick({
  email: true,
}).extend({
  code: z.string().length(6),
  tempToken: z.string().regex(REGEX.uuid, 'tempToken không hợp lệ'),
})

export const ResetPasswordBodySchema = UserSchema.pick({
  email: true,
})
  .extend({
    tempToken: z.string().regex(REGEX.uuid, 'tempToken không hợp lệ'),
    newPassword: z.string().min(6).max(50),
    confirmNewPassword: z.string().min(6).max(50),
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

export const DisableTwoFactorBodySchema = z
  .object({
    password: z.string().min(6).max(50),
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .superRefine(({ totpCode, code }, ctx) => {
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        path: ['code'],
        message: 'Cung cấp mã 2FA hoặc mã OTP',
        code: 'custom',
      })
      ctx.addIssue({
        path: ['totpCode'],
        message: 'Cung cấp 2FA PCode hoặc OTP',
        code: 'custom',
      })
    }
  })

export const TwoFactorSetupResSchema = z.object({
  secret: z.string().optional(),
  uri: z.string().optional(),
})

export const GetAuthMeResSchema = ResgisterResSchema.extend({
  role: RoleSchema.pick({
    id: true,
    name: true,
  }),
})

export type GetAuthMeResType = z.infer<typeof GetAuthMeResSchema>
export type RoleType = z.infer<typeof RoleSchema>
export type UserType = z.infer<typeof UserSchema>
export type ResgisterBodyType = z.infer<typeof ResgisterBodySchema>
export type ResgisterResType = z.infer<typeof ResgisterResSchema>
export type VerificationCodeType = z.infer<typeof VerificationCode>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefresTokenResType = LoginResType
export type DeiviceType = z.infer<typeof DeiviceSchema>
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export type LogoutBodyType = RefreshTokenBodyType
export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>
export type GetAuthorizationUrlResType = z.infer<typeof GetAuthorizationUrlResSchema>
export type ForgotPasswordType = z.infer<typeof ForgotPasswordBodySchema>
export type DisableTwoFactorBodyType = z.infer<typeof DisableTwoFactorBodySchema>
export type TwoFactorSetupResType = z.infer<typeof TwoFactorSetupResSchema>
export type VerifyLoginBodyType = z.infer<typeof VerifyLoginBodySchema>
export type VerifyResetCodeBodyType = z.infer<typeof VerifyResetCodeBodySchema>
export type ResetPasswordBodyType = z.infer<typeof ResetPasswordBodySchema>
