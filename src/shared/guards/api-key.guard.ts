import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from '../config'

@Injectable()
export class APIKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const xAPIKey = request.headers['x-api-key']

    if (!xAPIKey) {
      throw new UnauthorizedException('Thiếu API key trong header')
    }

    if (xAPIKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException('API key không hợp lệ')
    }
    return true
  }
}
