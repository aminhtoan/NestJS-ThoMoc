import { Injectable, NotFoundException } from '@nestjs/common'
import { UserTranslationRepository } from './user-translation.repo'
import { CreateUserTranslationBodyType, UpdateUserTranslationBodyType } from './user-translation.model'
import { isRecordNotFoundError } from 'src/shared/helpers' // Helper check lỗi P2025

@Injectable()
export class UserTranslationService {
  constructor(private readonly userTranslationRepository: UserTranslationRepository) {}

  async create(data: CreateUserTranslationBodyType, userId: number) {
    // Lưu ý: Có thể thêm logic check userId tồn tại ở đây nếu cần thiết
    return await this.userTranslationRepository.create(data, userId)
  }

  async findById(id: number) {
    const translation = await this.userTranslationRepository.findById(id)
    if (!translation) {
      throw new NotFoundException([
        {
          message: 'Bản dịch người dùng không tồn tại',
          path: 'userTranslationId',
        },
      ])
    }
    return translation
  }

  async update(id: number, data: UpdateUserTranslationBodyType, userId: number) {
    try {
      return await this.userTranslationRepository.update(id, data, userId)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Bản dịch bạn muốn cập nhật không tồn tại',
            path: 'userTranslationId',
          },
        ])
      }
      throw error
    }
  }

  async delete(id: number, userId: number) {
    try {
      await this.userTranslationRepository.delete(id, userId)
      return {
        message: 'Xóa bản dịch thành công',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Bản dịch bạn muốn xóa không tồn tại',
            path: 'userTranslationId',
          },
        ])
      }
      throw error
    }
  }
}
