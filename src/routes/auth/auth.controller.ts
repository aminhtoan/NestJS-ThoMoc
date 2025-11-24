import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Ip,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  DisableTwoFactorBodyDTO,
  ForgotPasswordBodyDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TwoFactorSetupResDTO,
  VerifyLoginBodyDTO,
} from './dto/auth.dto'
import { AuthService } from './services/auth.service'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResDto } from 'src/shared/dtos/response.dto'
import { GoogleService } from './services/google.service'
import { Throttle } from '@nestjs/throttler'
import envConfig from 'src/shared/config'
import type { Request, Response } from 'express'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import type { RedisClientType } from 'redis'
import { REDIS_CLIENT } from 'src/shared/services/redis.service'
import { AuthGuard } from '@nestjs/passport'
import { FacebookService } from './services/facebook.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
    private readonly facebookService: FacebookService,
  ) {}

  // is public là chọn type là none còn ko thì là bear có cung cấp accesstoke của file này AuthenticationGuard
  @IsPublic()
  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  register(@Body() body: RegisterBodyDTO) {
    return this.authService.register(body)
  }

  @IsPublic()
  @Post('otp')
  @ZodSerializerDto(MessageResDto)
  sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body)
  }

  @IsPublic()
  @Post('login/verify')
  @Throttle({ default: { limit: 5, ttl: 6000 } })
  loginCheck(@Body() body: VerifyLoginBodyDTO) {
    return this.authService.loginCheck(body)
  }

  @IsPublic()
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 6000 } })
  @ZodSerializerDto(LoginResDTO)
  login(@Body() body: LoginBodyDTO, @Ip() ip: string, @UserAgent() userAgent: string) {
    return this.authService.login({ ...body, ip, userAgent })
  }

  @IsPublic()
  @Post('refresh-token')
  @ZodSerializerDto(RefreshTokenResDTO)
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() body: RefreshTokenBodyDTO, @Ip() ip: string, @UserAgent() userAgent: string) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      ip,
      userAgent,
    })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDto)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @IsPublic()
  @Get('google-link')
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getGoogleLink(@Ip() ip: string, @UserAgent() userAgent: string) {
    return this.googleService.getGoogleLink({
      ip,
      userAgent,
    })
  }

  @IsPublic()
  @Get('google/callback')
  async GoogleCallBack(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.GoogleCallBack({ code, state })
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác'
      return res.redirect(`${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorsMessage=${message}`)
    }
  }

  @Post('/2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDTO)
  setUpTwoFactorAuth(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.setUpTwoFactorAuth(userId)
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResDto)
  disableTwoFactorAuth(@Body() body: DisableTwoFactorBodyDTO, @ActiveUser('userId') userId: number) {
    return this.authService.disableTwoFactorAuth(body, userId)
  }

  @Post('/forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDto)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  @IsPublic()
  @Get('facebook')
  async getFacebookLink(@Ip() ip: string, @UserAgent() userAgent: string) {
    return this.facebookService.getFacebookLink({ ip, userAgent })
  }

  @IsPublic()
  @Get('facebook/callback')
  async FacebookCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.facebookService.FacebookCallback({ code, state })
      return res.redirect(
        `${envConfig.FACEBOOK_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập Facebook thất bại, vui lòng thử lại'
      return res.redirect(`${envConfig.FACEBOOK_CLIENT_REDIRECT_URI}?errorsMessage=${message}`)
    }
  }
}
