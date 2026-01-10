import { Module } from '@nestjs/common'
import { AuthService } from './services/auth.service'
import { AuthController } from './auth.controller'
import { AuthRespository } from './repository/auth.repo'
import { GoogleService } from './services/google.service'
import { TwoFactorAuthService } from './services/two-factor.service'
import { FacebookService } from './services/facebook.service'
import { RolesService } from './services/roles.service'

@Module({
  providers: [AuthService, AuthRespository, GoogleService, TwoFactorAuthService, FacebookService, RolesService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
