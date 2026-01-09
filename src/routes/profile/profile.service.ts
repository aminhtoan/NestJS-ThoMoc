import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { TypeofVerificationCode } from 'src/shared/constants/auth.constant'
import { isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { HashingService } from 'src/shared/services/hashing.service'
import { AuthService } from '../auth/services/auth.service'
import {
  ChangeEmailProfileType,
  ChangePasswordProfileType,
  UpdateProfileBodyType,
  VerificationCodeType,
  VerifyEmailCodeType,
} from './profile.model'
import { ProfileRepository } from './profile.repo'

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly userService: AuthService,
    private readonly hashingService: HashingService,
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

  async verifyEmail(userId: number, body: VerificationCodeType) {
    try {
      const user = await this.profileRepository.verifyEmail(userId)

      await this.userService.sendOTP({
        type: body.type,
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
      throw error
    }
  }

  async changePassword(body: ChangePasswordProfileType, userId: number) {
    try {
      const user = await this.sharedUserRepository.findUnique({ id: userId })
      const VerifyOldPassword = await this.hashingService.compare(body.oldPassword, user.password)

      if (!VerifyOldPassword) {
        throw new UnprocessableEntityException([
          {
            message: 'Mật khẩu hiện tại không đúng',
            path: 'oldPassword',
          },
        ])
      }
      const hashPassword = await this.hashingService.hash(body.newPassword)
      console.log(hashPassword)
      await this.profileRepository.changePassword(hashPassword, userId)
      return {
        message: 'Đổi password thành công!',
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async changeEmail(body: ChangeEmailProfileType, userId: number) {
    try {
      await this.profileRepository.changeEmail(body.newEmail, userId)
      return {
        message: 'Đổi email thành công!',
      }
    } catch (error) {
      console.log(error)
      if (isUniqueConstraintError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email này đã được sử dụng bởi tài khoản khác',
            path: 'newEmail',
          },
        ])
      }
      throw error
    }
  }
}
