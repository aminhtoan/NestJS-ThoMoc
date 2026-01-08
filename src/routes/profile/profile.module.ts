import { Module } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { ProfileRepository } from './profile.repo'
import { AuthService } from '../auth/services/auth.service'
import { AuthRespository } from '../auth/repository/auth.repo'
import { AuthModule } from '../auth/auth.module'
import { RoleModule } from '../role/role.module'

@Module({
  imports: [RoleModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, AuthService, AuthRespository],
})
export class ProfileModule {}
