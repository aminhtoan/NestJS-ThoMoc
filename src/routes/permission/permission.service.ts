import { PermissionRepository } from './permission.repo'
import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import {
  CreatePermissionBodyType,
  GetPermissionParamType,
  GetPermissionQueryType,
  UpdatePermissionBodyType,
} from './permission.model'
import { isRecordNotFoundError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'

@Injectable()
export class PermissionService {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}
  async list(pagination: GetPermissionQueryType) {
    try {
      const res = await this.permissionRepository.list(pagination)
      return res
    } catch (error) {
      throw error
    }
  }

  async findById(permissionId: GetPermissionParamType) {
    try {
      const res = await this.permissionRepository.findById(permissionId)

      return res
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Permission không tồn tại')
      }
      throw error
    }
  }

  async create(body: CreatePermissionBodyType, userId: number) {
    try {
      const user = await this.sharedUserRepository.findUnique({ id: userId })

      if (!user) {
        throw new UnprocessableEntityException({
          message: 'Không tìn thấy thông tin đăng nhập của bạn',
          path: 'id',
        })
      }

      const data = { ...body, createdById: user.id, updatedById: user.id }
      return await this.permissionRepository.create(data)
    } catch (error) {
      throw error
    }
  }

  async update(body: UpdatePermissionBodyType, permissionId: GetPermissionParamType, userId: number) {
    try {
      await this.permissionRepository.findById(permissionId)

      const data = { ...body, updatedById: userId }
      return await this.permissionRepository.update(data, permissionId)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Permission không tồn tại')
      }
      throw error
    }
  }

  async delete(permissionId: GetPermissionParamType, userId: number) {
    try {
      await this.permissionRepository.findById(permissionId)

      await this.permissionRepository.delete(permissionId, false, userId)
      return {
        message: 'Xóa thông tin Permission thành công',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Permission bạn muốn xóa không tồn tại hoặc bị soft delete',
            path: 'id',
          },
        ])
      }
      throw error
    }
  }
}
