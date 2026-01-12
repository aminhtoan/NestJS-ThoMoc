import { SharedRolesRepo } from './../../shared/repositories/shared-roles.repo'
import { HashingService } from './../../shared/services/hashing.service'
import { ForbiddenException, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { UserRepository } from './user.repo'
import { CreateUserBodyType, GetUserParamsType, UpdateUserBodyType } from './user.model'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { RoleName } from 'src/shared/constants/role.constant'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly hashingService: HashingService,
    private readonly sharedRolesRepo: SharedRolesRepo,
  ) {}

  private async verifyRole({ roleNameAgent, roleIdTarget }) {
    if (roleNameAgent === RoleName.Admin) {
      return true
    } else {
      const adminRoleId = await this.sharedRolesRepo.getAdminRoleId()

      if (roleIdTarget === adminRoleId) {
        throw new ForbiddenException('Không có quyền gán role Admin')
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

  async update(params: GetUserParamsType, body: UpdateUserBodyType, userId: number) {
    try {
      if (body.password) {
        const hashPassword = this.hashingService.hash(body.password)
      }
      return await this.userRepository.update(body, params, userId)
    } catch (error) {
      throw error
    }
  }
}
