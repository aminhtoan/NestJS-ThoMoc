import { ForbiddenException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from '@nestjs/common'
import { CreateRoleBodyType, GetRoleParamsType, GetRoleQueryType, UpdateRoleBodyType } from './role.model'
import { RoleRepository } from './role.repo'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { GetPermissionParamType } from '../permission/permission.model'
import { SharedPermissionRepository } from 'src/shared/repositories/shared-permission'
import { RoleName, RoleNameType } from 'src/shared/constants/role.constant'

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name)
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sharedPermissionRepository: SharedPermissionRepository,
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
          message: 'Không tìm thấy thông tin đăng nhập của bạn',
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

  async findById(params: GetRoleParamsType) {
    try {
      return await this.roleRepository.findById(params.roleId)
    } catch (error) {
      console.log('[Error:FindByIdService] ', error)
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Không tìm thấy thông tin Role.')
      }
      throw error
    }
  }

  async findByIdPermission(params: GetPermissionParamType) {
    try {
      await this.sharedPermissionRepository.findById(params.permissionId)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Không tìm thấy thông tin Permission.')
      }
      throw error
    }
  }
  async update(body: UpdateRoleBodyType, userId: number, params: GetRoleParamsType) {
    const currentRole = await this.roleRepository.findById(params.roleId)

    /*Để hệ thống hoạt động ổn định thì ta nên
    -Không cho phép bất kỳ ai có thể xóa 3 role cơ bản này: ADMIN, CLIENT, SELLER.
    Không cho bất kỳ ai cập nhật role ADMIN, kể cả user với role ADMIN. 
    Tránh ADMIN này thay đổi permission làm mất quyền kiểm soát hệ thống.*/
    if (RoleName.Admin === currentRole.name) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa tài nguyên này')
    }

    if (body.permissionIds && body.permissionIds.length > 0) {
      const permissionPromises = body.permissionIds.map((id) => this.findByIdPermission({ permissionId: id }))
      await Promise.all(permissionPromises)
    }

    const newName = body.name ? this.roleRepository.normalizeRoleName(body.name) : undefined

    if (!currentRole) {
      throw new NotFoundException('Role cần cập nhật không tồn tại.')
    }

    if (newName && currentRole.name !== newName) {
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
          message: 'Không tìm thấy thông tin đăng nhập của bạn',
          path: 'id',
        },
      ])
    }

    try {
      const updateData: any = { ...body, updatedById: user.id }

      if (newName !== undefined) {
        updateData.name = newName
      } else {
        delete updateData.name
      }

      await this.roleRepository.update(updateData, params)

      return {
        message: 'Cập nhật thành công',
      }
    } catch (error) {
      this.logger.error(`Failed to update role: ${error.message}`, error.stack)
      if (isUniqueConstraintError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Tên Role đã tồn tại (Lỗi hệ thống)',
            path: 'name',
          },
        ])
      }
      throw error
    }
  }

  async delete(userId: number, params: GetRoleParamsType) {
    const role = await this.findById(params)

    if ([RoleName.Admin, RoleName.Client, RoleName.Seller].includes(role.name as RoleNameType)) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa tài nguyên này')
    }

    const user = await this.sharedUserRepository.findUnique({ id: userId })

    if (!user) {
      throw new UnprocessableEntityException([
        {
          message: 'Không tìm thấy thông tin đăng nhập của bạn',
          path: 'id',
        },
      ])
    }

    try {
      const hard = false
      await this.roleRepository.delete(userId, params, hard)

      return {
        message: 'Role đã được xóa.',
      }
    } catch (error) {
      console.log('[Error:DeleteService] ', error)
      throw error
    }
  }

  async list(pagination: GetRoleQueryType) {
    try {
      const res = await this.roleRepository.list(pagination)
      return res
    } catch (error) {
      throw error
    }
  }
}
