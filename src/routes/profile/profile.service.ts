import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { ProfileRepository } from './profile.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { isRecordNotFoundError } from 'src/shared/helpers'

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly sharedUserRepository: SharedUserRepository,
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
}
