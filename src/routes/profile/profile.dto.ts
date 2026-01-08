import { createZodDto } from 'nestjs-zod'
import {
  ChangePasswordProfileSchema,
  GetProfileDetailResSchema,
  UpdateProfileBodySchema,
  VerifyEmailCodeSchema,
  VerifyEmailSchema,
} from './profile.model'

export class GetProfileDetailResDTO extends createZodDto(GetProfileDetailResSchema) {}
export class UpdateProfileBodyDTO extends createZodDto(UpdateProfileBodySchema) {}
export class VerifyEmailDTO extends createZodDto(VerifyEmailSchema) {}
export class VerifyEmailCodeDTO extends createZodDto(VerifyEmailCodeSchema) {}
export class ChangePasswordProfileDTO extends createZodDto(ChangePasswordProfileSchema) {}
