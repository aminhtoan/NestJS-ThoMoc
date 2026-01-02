import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { CreateRoleBodyType, GetRoleParamsType, UpdateRoleBodyType } from './role.model'
import { RoleRepository } from './role.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { isRecordNotFoundError } from 'src/shared/helpers'

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name)
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly sharedUserRepository: SharedUserRepository,
  ) {}

  async create(body: CreateRoleBodyType, userId: number) {
    const normalizedName = this.roleRepository.normalizeRoleName(body.name)

    const isExisted = await this.roleRepository.findByName(normalizedName)

    if (isExisted) {
      throw new UnprocessableEntityException([
        {
          message: 'Role đã tồn tại',
          path: 'name',
        },
      ])
    }
    const user = await this.sharedUserRepository.findUnique({ id: userId })

    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Không tìn thấy thông tin đăng nhập của bạn',
          path: 'id',
        },
      ])
    }
    try {
      const data = { ...body, name: normalizedName, createdById: user.id, updatedById: user.id }
      return await this.roleRepository.create(data)
    } catch (error) {
      console.log('[Error:CreateService] ', error)
      throw error
    }
  }

  async findByName(params: GetRoleParamsType) {
    try {
      const normalizedName = this.roleRepository.normalizeRoleName(params.roleName)

      return await this.roleRepository.findByName(normalizedName)
    } catch (error) {
      console.log('[Error:FindByIdService] ', error)
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Không tìn thấy thông tin Role.')
      }
      throw error
    }
  }

  async update(body: UpdateRoleBodyType, userId: number, params: GetRoleParamsType) {
    const targetName = this.roleRepository.normalizeRoleName(params.roleName)
    const newName = this.roleRepository.normalizeRoleName(body.name)

    const currentRole = await this.roleRepository.findByName(targetName)
    if (!currentRole) {
      throw new NotFoundException('Role cần cập nhật không tồn tại.')
    }
    if (targetName !== newName) {
      const duplicateRole = await this.roleRepository.findByName(newName)
      if (duplicateRole) {
        throw new UnprocessableEntityException([
          {
            message: `Role name '${newName}' đã được sử dụng bởi role khác`,
            path: 'name',
          },
        ])
      }
    }

    const user = await this.sharedUserRepository.findUnique({ id: userId })

    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Không tìn thấy thông tin đăng nhập của bạn',
          path: 'id',
        },
      ])
    }
    try {
      const data = { ...body, name: newName, updatedById: user.id }
      await this.roleRepository.update(data, params)
      return {
        message: 'Cập nhật thành công',
      }
    } catch (error) {
      this.logger.error(`Failed to update role: ${error.message}`, error.stack)
      throw error
    }
  }
}
