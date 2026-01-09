import { Body, Controller, Get, Patch, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import {
  ChangeEmailProfileDTO,
  ChangePasswordProfileDTO,
  GetProfileDetailResDTO,
  UpdateProfileBodyDTO,
  VerificationCodeDTO,
  VerifyEmailCodeDTO,
} from './profile.dto'
import { ProfileService } from './profile.service'
import { MessageResDto } from 'src/shared/dtos/response.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetProfileDetailResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }

  @Patch()
  @ZodSerializerDto(MessageResDto)
  updateProfile(@ActiveUser('userId') userId: number, @Body() body: UpdateProfileBodyDTO) {
    return this.profileService.updateProfile(userId, body)
  }

  @Post('verify-email')
  @ZodSerializerDto(MessageResDto)
  verifyEmail(@ActiveUser('userId') userId: number, @Body() body: VerificationCodeDTO) {
    return this.profileService.verifyEmail(userId, body)
  }

  @Post('verify-email-code')
  @ZodSerializerDto(MessageResDto)
  verifyEmailCodeSchema(@Body() body: VerifyEmailCodeDTO) {
    return this.profileService.verifyEmailCodeSchema(body)
  }

  @Put('change-password')
  @ZodSerializerDto(MessageResDto)
  changePassword(@Body() body: ChangePasswordProfileDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.changePassword(body, userId)
  }

  @Put('change-email')
  @ZodSerializerDto(MessageResDto)
  changeEmail(@Body() body: ChangeEmailProfileDTO, @ActiveUser('userId') userId: number) {
    return this.profileService.changeEmail(body, userId)
  }
}
