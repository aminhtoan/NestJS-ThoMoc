import { AuthType, ConditionGuard } from './../constants/auth.constant'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from '../config'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayLoad } from '../decorators/auth.decorator'
import { AccessTokenGuard } from './access-token.guard'

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>
  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.Apikey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayLoad | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AuthType.Bearer], options: { condition: ConditionGuard.And } }

    const guards = authTypeValue.authTypes.map((authType) => this.authTypeGuardMap[authType])

    if (authTypeValue.options.condition === ConditionGuard.Or) {
      for (const guard of guards) {
        try {
          // dùng try catch là do trong access-token.guard.ts sẽ ném throw ra gây lỗi ko chạy hết for được
          const canActivate = await guard.canActivate(context)
          if (canActivate) {
            return true
          }
        } catch {
          continue
        }
      }
      throw new UnauthorizedException()
    } else {
      for (const guard of guards) {
        try {
          const canActivate = await guard.canActivate(context)
          if (!canActivate) {
            throw new UnauthorizedException()
          }
        } catch {
          throw new UnauthorizedException()
        }
      }
      return true
    }
  }
}
