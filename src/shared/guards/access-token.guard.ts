import { error } from 'console'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common'
import { TokenService } from '../services/token.service'
import { REQUEST_ROLE_PERMISSION, REQUEST_USER_KEY } from '../constants/auth.constant'
import { AccessTokenPayLoad } from '../types/jwt.type'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const accessToken = request.headers['authorization']?.split(' ')[1]

    if (!accessToken) {
      throw new UnauthorizedException('Invalid access token')
    }

    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      await this.validateUserPermission(decodedAccessToken, request)

      return true
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error
      }

      if (error instanceof UnauthorizedException) {
        throw error
      }
      throw new UnauthorizedException('Invalid access token')
    }
  }

  private async validateUserPermission(decodedAccessToken: AccessTokenPayLoad, request: any): Promise<void> {
    const roleId = decodedAccessToken.roleId
    const path = request.route.path
    const method = request.method

    const role = await this.prismaService.role
      .findUniqueOrThrow({
        where: {
          id: roleId,
          deletedAt: null,
          isActive: true,
        },
        include: {
          permissions: {
            where: {
              deletedAt: null,
            },
          },
        },
      })
      .catch(() => {
        throw new ForbiddenException('Bạn không có quyền truy cập vào tài nguyên này.')
      })

    const canAccess = role.permissions.some(
      (permission) => permission.method === method && permission.path === path.replace(/^\/api/, ''),
    )
    if (!canAccess) {
      throw new ForbiddenException('Bạn không có quyền truy cập vào tài nguyên này.')
    }

    request[REQUEST_ROLE_PERMISSION] = role
  }
}
