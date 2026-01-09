import { Module } from '@nestjs/common'
import { AuthService } from './services/auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './services/roles.service'
import { AuthRespository } from './repository/auth.repo'
import { GoogleService } from './services/google.service'
import { TwoFactorAuthService } from './services/two-factor.service'
import { FacebookService } from './services/facebook.service'

@Module({
  providers: [AuthService, RolesService, AuthRespository, GoogleService, TwoFactorAuthService, FacebookService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
