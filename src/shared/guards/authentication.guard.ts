import { CanActivate, ExecutionContext, HttpException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { APIKeyGuard } from 'src/shared/guards/api-key.guard'
import { AUTH_TYPE_KEY, AuthTypeDecoratorPayLoad } from '../decorators/auth.decorator'
import { AuthType, ConditionGuard } from './../constants/auth.constant'
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
      return this.guardConditionOr(context, guards)
    } else {
      return this.guardConditionAnd(context, guards)
    }
  }

  private async guardConditionOr(context: ExecutionContext, guards: CanActivate[]): Promise<boolean> {
    let lastErorr: any = null
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context)
        if (canActivate) {
          return true
        }
      } catch (error) {
        lastErorr = error
      }
    }

    if (lastErorr instanceof HttpException) {
      throw lastErorr
    }
    throw new UnauthorizedException()
  }

  private async guardConditionAnd(context: ExecutionContext, guards: CanActivate[]): Promise<boolean> {
    for (const guard of guards) {
      try {
        const canActivate = await guard.canActivate(context)
        if (!canActivate) {
          throw new UnauthorizedException()
        }
      } catch (error) {
        if (error instanceof HttpException) {
          throw error
        }

        throw new UnauthorizedException()
      }
    }
    return true
  }
}
