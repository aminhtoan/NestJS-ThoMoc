import { UserStatus } from 'src/shared/constants/auth.constant'
import { REGEX } from 'src/shared/constants/regex.constant'
import z from 'zod'
import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { RoleSchema } from 'src/shared/models/shared-role.model'

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

export type UserType = z.infer<typeof UserSchema>
export type GetProfileDetailResType = z.infer<typeof GetProfileDetailResSchema>
