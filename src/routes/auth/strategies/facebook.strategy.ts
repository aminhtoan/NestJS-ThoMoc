import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-facebook'
import envConfig from 'src/shared/config'

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor() {
    super({
      clientID: envConfig.FACEBOOK_APP_ID,
      clientSecret: envConfig.FACEBOOK_APP_SECRET,
      callbackURL: envConfig.FACEBOOK_CALLBACK_URL,
      scope: 'email',
      profileFields: ['emails', 'name'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    const { name, emails } = profile
    const user = {
      email: emails?.[0]?.value ?? null,
      firstName: name?.givenName ?? '',
      lastName: name?.familyName ?? '',
    }
    const payload = {
      user,
      accessToken,
    }

    done(null, payload)
  }
}
