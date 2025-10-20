import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './roles.service'
import { AuthRespository } from './auth.repo'

@Module({
  providers: [AuthService, RolesService, AuthRespository],
  controllers: [AuthController],
})
export class AuthModule {}
