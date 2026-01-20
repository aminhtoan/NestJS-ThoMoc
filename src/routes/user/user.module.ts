import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { UserRepository } from './user.repo'
import { UserTranslationModule } from './user-translation/user-translation.module';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository],
  imports: [UserTranslationModule],
})
export class UserModule {}
