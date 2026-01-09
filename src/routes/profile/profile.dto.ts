import { createZodDto } from 'nestjs-zod'
import {
  ChangeEmailProfileSchema,
  ChangePasswordProfileSchema,
  GetProfileDetailResSchema,
  UpdateProfileBodySchema,
  VerificationCodeSchema,
  VerifyEmailCodeSchema,
  VerifyEmailSchema,
} from './profile.model'

export class GetProfileDetailResDTO extends createZodDto(GetProfileDetailResSchema) {}
export class UpdateProfileBodyDTO extends createZodDto(UpdateProfileBodySchema) {}
export class VerifyEmailDTO extends createZodDto(VerifyEmailSchema) {}
export class VerifyEmailCodeDTO extends createZodDto(VerifyEmailCodeSchema) {}
export class ChangePasswordProfileDTO extends createZodDto(ChangePasswordProfileSchema) {}
export class ChangeEmailProfileDTO extends createZodDto(ChangeEmailProfileSchema) {}
export class VerificationCodeDTO extends createZodDto(VerificationCodeSchema) {}
