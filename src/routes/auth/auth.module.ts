import { Module } from '@nestjs/common'
import { AuthService } from './services/auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './services/roles.service'
import { AuthRespository } from './repository/auth.repo'
import { GoogleService } from './services/google.service'
import { TwoFactorAuthService } from './services/two-factor.service'
import { FacebookStrategy } from './strategies/facebook.strategy'
import { FacebookService } from './services/facebook.service'
import { WebhookController } from './webhook.controller'

@Module({
  providers: [
    AuthService,
    RolesService,
    AuthRespository,
    GoogleService,
    TwoFactorAuthService,
    FacebookStrategy,
    FacebookService,
  ],
  controllers: [AuthController, WebhookController],
})
export class AuthModule {}
