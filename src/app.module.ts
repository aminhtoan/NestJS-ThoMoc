import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import { LanguagesModule } from './routes/languages/languages.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { AuthenticationGuard } from './shared/guards/authentication.guard'
import { MyThrottlerGuard } from './shared/guards/custom-throttler.guard'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from './shared/shared.module'
import { PermissionModule } from './routes/permission/permission.module'
import { RoleModule } from './routes/role/role.module'
import { ProfileModule } from './routes/profile/profile.module'
import { UserModule } from './routes/user/user.module'
import { MediaModule } from './routes/media/media.module'

@Module({
  imports: [
    SharedModule,
    AuthModule,
    LanguagesModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000 * 60,
          limit: 10,
        },
      ],
    }),
    LanguagesModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MyThrottlerGuard,
    },
  ],
})
export class AppModule {}
