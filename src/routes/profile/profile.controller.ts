import { Controller, Get } from '@nestjs/common'
import { ProfileService } from './profile.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { GetProfileDetailResDTO } from './profile.dto'

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ZodSerializerDto(GetProfileDetailResDTO)
  getProfile(@ActiveUser('userId') userId: number) {
    return this.profileService.getProfile(userId)
  }
}
