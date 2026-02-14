import { Module } from '@nestjs/common'
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './routes/auth/auth.module'
import { LanguagesModule } from './routes/languages/languages.module'
import { MediaModule } from './routes/media/media.module'
import { PermissionModule } from './routes/permission/permission.module'
import { ProfileModule } from './routes/profile/profile.module'
import { RoleModule } from './routes/role/role.module'
import { UserModule } from './routes/user/user.module'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { AuthenticationGuard } from './shared/guards/authentication.guard'
import { MyThrottlerGuard } from './shared/guards/custom-throttler.guard'
import CustomZodValidationPipe from './shared/pipes/custom-zod-validation.pipe'
import { SharedModule } from './shared/shared.module'
import { BrandModule } from './routes/brand/brand.module'
import { AcceptLanguageResolver, HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n'
import { CategoryModule } from './routes/category/category.module'
import { ProductModule } from './routes/product/product.module'
import { CartModule } from './routes/cart/cart.module'
import { OrderModule } from './routes/order/order.module'
import * as path from 'path'
import { CacheModule } from '@nestjs/cache-manager'
import { PaymentModule } from './routes/payment/payment.module'
import { BullModule } from '@nestjs/bullmq'
import { WebsocketsModule } from './websockets/websockets.module'
import { ReviewModule } from './routes/review/review.module'
import { MessageModule } from './routes/message/message.module'
import { DeliveryMethodModule } from './routes/delivery-method/delivery-method.module'
import envConfig from './shared/config'

@Module({
  imports: [
    // CacheModule.register({ isGlobal: true }),
    BullModule.forRoot({
      connection: {
        // host: 'localhost',
        // port: 6379,
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
        username: envConfig.REDIS_USERNAME,
        password: envConfig.REDIS_PASSWORD,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      },
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver, new HeaderResolver(['x-lang'])],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
    SharedModule,
    AuthModule,
    LanguagesModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1000 * 60,
          limit: 100,
        },
      ],
    }),
    LanguagesModule,
    PermissionModule,
    RoleModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule,
    OrderModule,
    PaymentModule,
    WebsocketsModule,
    ReviewModule,
    MessageModule,
    DeliveryMethodModule,
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
