import { Module } from '@nestjs/common'
import { UserTranslationService } from './user-translation.service'
import { UserTranslationController } from './user-translation.controller'
import { UserTranslationRepository } from './user-translation.repo'

@Module({
  controllers: [UserTranslationController],
  providers: [UserTranslationService, UserTranslationRepository],
})
export class UserTranslationModule {}
