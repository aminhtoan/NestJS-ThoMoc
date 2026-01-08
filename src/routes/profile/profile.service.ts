import { email } from 'zod'
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { ProfileRepository } from './profile.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { isRecordNotFoundError } from 'src/shared/helpers'
import { ChangePasswordProfileType, UpdateProfileBodyType, VerifyEmailCodeType } from './profile.model'
import { AuthService } from '../auth/services/auth.service'
import { TypeofVerificationCode } from 'src/shared/constants/auth.constant'

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly userService: AuthService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.sharedUserRepository.findUnique({ id: userId })

    if (!user) {
      throw new UnprocessableEntityException({
        message: 'Không tìn thấy thông tin đăng nhập của bạn',
        path: 'id',
      })
    }

    try {
      const res = await this.profileRepository.getProfile(user.id)
      return res
    } catch (error) {
      console.log(error)
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Không tìm thấy thông tin hồ sơ người dùng.')
      }
      throw error
    }
  }

  async updateProfile(userId: number, body: UpdateProfileBodyType) {
    try {
      await this.profileRepository.updateProfile(userId, body)
      return {
        message: 'Update thành công Profile người dùng',
      }
    } catch (error) {
      throw error
    }
  }

  async verifyEmail(userId: number) {
    try {
      const user = await this.profileRepository.verifyEmail(userId)

      await this.userService.sendOTP({
        type: TypeofVerificationCode.CHANGE_PASSWORD,
        email: user.email,
      })

      return {
        message: 'Xác nhận thành công!',
      }
    } catch (error) {
      console.error('[ProfileService:verifyEmail] Error:', error)
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại hoặc liên hệ hỗ trợ.')
      }

      throw new InternalServerErrorException('Hệ thống đang bận, vui lòng thử lại sau vài phút.')
    }
  }

  async verifyEmailCodeSchema(body: VerifyEmailCodeType) {
    try {
      await this.userService.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: body.type,
      })
      return {
        message: 'Xác thực thành công thành công!',
      }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Hệ thống đang bận, vui lòng thử lại sau vài phút.')
    }
  }

  async changePassword(body: ChangePasswordProfileType, userId: number) {
    try {
      await this.profileRepository.changePassword(body, userId)
      return {
        message: 'Đổi password thành công!',
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
