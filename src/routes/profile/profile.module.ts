import { Module } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ProfileController } from './profile.controller'
import { ProfileRepository } from './profile.repo'
import { AuthRespository } from '../auth/repository/auth.repo'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [AuthModule],
  controllers: [ProfileController],
  providers: [ProfileService, ProfileRepository, AuthRespository],
})
export class ProfileModule {}
