import { AuthenticationGuard } from 'src/shared/guards/authentication.guard'
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { JwtModule } from '@nestjs/jwt'
import { TokenService } from './services/token.service'
import { AccessTokenGuard } from './guards/access-token.guard'
import { APIKeyGuard } from './guards/api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { SendEmail } from './services/email.service'
import { RedisServices } from './services/redis.service'

const sharedServices = [PrismaService, HashingService, TokenService, SharedUserRepository, SendEmail, RedisServices]

@Global()
@Module({
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIKeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: [...sharedServices, AccessTokenGuard, APIKeyGuard],
  imports: [JwtModule],
})
export class SharedModule {}
