import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_ROLE_PERMISSION } from '../constants/auth.constant'
import { GetRoleDetailResType } from '../models/shared-role.model'

export const ActiveRolePermission = createParamDecorator(
  (field: keyof GetRoleDetailResType | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const rolePermissions: GetRoleDetailResType | undefined = request[REQUEST_ROLE_PERMISSION]
    return field ? rolePermissions?.[field] : rolePermissions
  },
)
