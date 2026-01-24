import { ConflictException, Inject, Injectable } from '@nestjs/common'
import * as OTPAuth from 'otpauth'
import envConfig from 'src/shared/config'
import { REDIS_CLIENT } from 'src/shared/services/redis.service'
import type { RedisClientType } from 'redis'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class TwoFactorAuthService {
  // nject(REDIS_CLIENT) private readonly redis: RedisClientType
  constructor(@Inject(CACHE_MANAGER) private readonly redis: Cache) {}
  private createTOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    })
  }

  generateTOTPSecret(email: string) {
    const totp = this.createTOTP(email)

    return {
      totp: totp.secret.base32,
      uri: totp.toString(),
    }
  }

  async verifyTOTP({ email, secret, token }: { email: string; secret: string; token: string }): Promise<boolean> {
    const totp = this.createTOTP(email, secret)

    const used = await this.redis.get(`2fa:used:${email}:${token}`)

    if (used) {
      throw new ConflictException([
        {
          message: 'Mã xác thực đã được sử dụng. Vui lòng yêu cầu mã mới.',
          path: 'totpCode',
        },
      ])
    }

    let delta = totp.validate({ token, window: 1 })
    await this.redis.set(`2fa:used:${email}:${token}`, '1', 30000)

    return delta !== null
  }
}
