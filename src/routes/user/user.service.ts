import { SharedRolesRepo } from './../../shared/repositories/shared-roles.repo'
import { HashingService } from './../../shared/services/hashing.service'
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { UserRepository } from './user.repo'
import { CreateUserBodyType, GetUserParamsType, GetUserQueryType, UpdateUserBodyType } from './user.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { RoleName } from 'src/shared/constants/role.constant'
import { I18nContext } from 'nestjs-i18n'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
    private readonly sharedRolesRepo: SharedRolesRepo,
  ) {}

  private async verifyRole({ roleNameAgent, roleIdTarget }: { roleNameAgent: string; roleIdTarget: number }) {
    if (roleNameAgent === RoleName.Admin) {
      return true
    } else {
      const adminRoleId = await this.sharedRolesRepo.getAdminRoleId()
      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException('Không có quyền tác động role Admin')
      }
      return true
    }
  }
  async create(body: CreateUserBodyType, userId: number, roleName: string) {
    try {
      await this.verifyRole({
        roleNameAgent: roleName,
        roleIdTarget: body.roleId,
      })

      await this.sharedUserRepository.findUnique({ email: body.email })

      const hashPassword = this.hashingService.hash(body.password)

      const dataCreate: CreateUserBodyType = { ...body, password: hashPassword }

      return await this.userRepository.create(dataCreate, userId)
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã được sử dụng',
            path: 'email',
          },
        ])
      }
      throw error
    }
  }

  async update(params: GetUserParamsType, body: UpdateUserBodyType, userId: number, roleName: string) {
    try {
      const dataUpdate = { ...body }

      if (params.userId === userId) {
        throw new UnprocessableEntityException([
          {
            message: 'Bạn không thể cập nhật chính mình',
            path: 'permission',
          },
        ])
      }
      await this.verifyRole({
        roleNameAgent: roleName,
        roleIdTarget: body.roleId,
      })

      if (body.password) {
        dataUpdate.password = await this.hashingService.hash(body.password)
      }

      return await this.userRepository.update(dataUpdate, params, userId)
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ConflictException('Email đã được sử dụng')
      }

      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Tài khoản không tồn tại')
      }
      throw error
    }
  }

  async delete(params: GetUserParamsType, userId: number, roleName: string) {
    try {
      const targetUser = await this.sharedUserRepository.findUnique({ id: params.userId })
      await this.verifyRole({
        roleNameAgent: roleName,
        roleIdTarget: targetUser.role.id,
      })

      if (params.userId === userId) {
        throw new UnprocessableEntityException([
          {
            message: 'Bạn không thể xóa chính mình',
            path: 'permission',
          },
        ])
      }

      const hard = false
      await this.userRepository.delete(params, userId, hard)
      return {
        message: 'Xóa thành công user!!!',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Tài khoản không tồn tại')
      }
      throw error
    }
  }

  async findOne(params: GetUserParamsType) {
    try {
      return await this.sharedUserRepository.findUnique({ id: params.userId })
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException('Tài khoản không tồn tại')
      }
      throw error
    }
  }

  async findMany({ page, limit }: GetUserQueryType) {
    return await this.userRepository.findPagination({ page, limit, },I18nContext.current()?.lang)
  }
}
