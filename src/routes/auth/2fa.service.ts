import { Injectable } from '@nestjs/common'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import * as OTPAuth from 'otpauth'
import envConfig from 'src/shared/config'
import { generateOTP } from 'src/shared/helpers'

@Injectable()
export class TwoFactorAuthService {
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
    let delta = totp.validate({ token, window: 1 }) // cho phép lệch thơi gian, khấu hao
    return delta !== null
  }
}

// const t = new TwoFactorAuthService()
// console.log(
//   t.verifyTOTP({
//     email: 'minhtoanpham1412@gmail.com',
//     secret: 'WBXSDTGD2KHMLWVYZPJCMN7D3BWMIS46',
//     token: '038458',
//   }),
// )
