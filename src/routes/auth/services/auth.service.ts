import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms, { type StringValue } from 'ms'
import envConfig from 'src/shared/config'
import { TypeofVerificationCode, TypeofVerificationCodeType } from 'src/shared/constants/auth.constant'
import { generateOTP, isRecordNotFoundError, isUniqueConstraintError } from 'src/shared/helpers'
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repo'
import { SendEmail } from 'src/shared/services/email.service'
import { AccessTokenPayLoadCreate } from 'src/shared/types/jwt.type'
import { TokenService } from '../../../shared/services/token.service'
import { LoginBodyDTO, RefreshTokenBodyDTO } from '../dto/auth.dto'
import {
  DisableTwoFactorBodyType,
  ForgotPasswordType,
  LoginBodyType,
  ResetPasswordBodyType,
  ResgisterBodyType,
  SendOTPBodyType,
  VerifyLoginBodyType,
  VerifyResetCodeBodyType,
} from '../models/auth.model'
import { AuthRespository } from '../repository/auth.repo'
import { RolesService } from './roles.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { TwoFactorAuthService } from './two-factor.service'
import { REDIS_CLIENT } from 'src/shared/services/redis.service'
import type { RedisClientType } from 'redis'
import { TypeTempRedis } from 'src/shared/constants/redis.constant'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly authRespository: AuthRespository,
    private readonly rolesService: RolesService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly sendEmail: SendEmail,
    private readonly tokenService: TokenService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
  ) {}

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeofVerificationCodeType
  }) {
    // kiểm tra code có tồn tại không
    const verificationCode = await this.authRespository.findUniqueVerificationCode({
      email_code_type: {
        email: email,
        code: code,
        type: type,
      },
    })

    if (!verificationCode) {
      throw new UnprocessableEntityException([
        {
          message: 'Mã OTP không hợp lệ',
          path: 'code',
        },
      ])
    }

    // kiểm tra hạn của otp 5m so với giờ hiện tại
    if (verificationCode.expiresAt < new Date()) {
      throw new UnprocessableEntityException([
        {
          message: 'Mã OTP đã hết hạn',
          path: 'code',
        },
      ])
    }

    return verificationCode
  }

  async register(body: ResgisterBodyType) {
    try {
      // tạo verification code và kiểm tra ...
      await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeofVerificationCode.REGISTER,
      })

      // lấy ra role id, role đc mặc định sãn là client || còn có seller và admin
      const clientRoleId = await this.rolesService.getClientRoleId()

      // hash password
      const hashedPassword = await this.hashingService.hash(body.password)

      // desttructuring, loại bỏ  confirmPassword, code
      const { confirmPassword, code, ...restBody } = body

      // spread operator để trải dữ liệu ra
      const userData = {
        ...restBody,
        roleId: clientRoleId,
        password: hashedPassword,
      }

      // tạo user
      const user = await this.authRespository.createUser(userData)

      // xóa otp code vừa đăng ký để an toàn
      await this.authRespository.deleleVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeofVerificationCode.REGISTER,
        },
      })

      return user
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã tồn tại',
            path: 'email',
          },
        ])
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    try {
      const user = await this.sharedUserRepository.findUnique({ email: body.email })

      if (user && body.type === TypeofVerificationCode.REGISTER) {
        throw new UnprocessableEntityException([
          {
            message: 'Email đã tồn tại',
            path: 'email',
          },
        ])
      }

      if (!user && body.type === TypeofVerificationCode.FORGOT_PASSWORD) {
        throw new UnprocessableEntityException([
          {
            message: 'Không tìm thấy email',
            path: 'email',
          },
        ])
      }

      // gernerate OTP 6 số ngẫu nhiên
      const code = generateOTP()

      // tạo verification code với hạn là 5m
      await this.authRespository.createVerification({
        email: body.email,
        code,
        type: body.type,
        expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as StringValue)),
      })

      // Gửi mã otp
      const { error } = await this.sendEmail.sendEmail({ email: body.email, code: code })

      if (error) {
        throw new UnprocessableEntityException([
          {
            message: 'Gửi mã OTP thất bại',
            path: 'code',
          },
        ])
      }

      return {
        message: 'Gửi mã OTP thành công',
      }
    } catch (error) {
      console.error('[AuthService:SendOTP]', error)
      throw error
    }
  }

  async loginCheck(body: VerifyLoginBodyType) {
    const { email, password } = body

    // 1. Kiểm tra user có tồn tại không
    const user = await this.authRespository.findUniqueUserIncludeRole({ email })
    if (!user) {
      throw new UnprocessableEntityException([
        {
          field: 'email',
          error: 'Email bạn chưa từng được đăng ký',
        },
      ])
    }

    // 2. Check password
    const isMatch = await this.hashingService.compare(password, user.password)
    if (!isMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'Email hoặc mật khẩu không đúng',
        },
      ])
    }

    const tempToken = crypto.randomUUID()

    await this.redis.set(`login-temp:${tempToken}`, JSON.stringify({ userId: user.id }), {
      EX: 300,
    })

    return {
      needOTP: !user.totpSecret,
      needTOTP: !!user.totpSecret,
      tempToken,
    }
  }

  async login(body: LoginBodyType & { ip: string; userAgent: string }) {
    const temp = await this.redis.get(`login-temp:${body.tempToken}`)
    if (!temp) {
      throw new UnprocessableEntityException([
        {
          message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ',
          path: 'tempToken',
        },
      ])
    }
    const checkuser = JSON.parse(temp)

    // kiểm tra email có tồn tại, check password có đúng không
    const user = await this.authRespository.findUniqueUserIncludeRole({
      id: checkuser.userId,
    })

    if (!user) {
      throw new UnauthorizedException('Email không tồn tại')
    }

    // FORM 1: User có 2FA → chỉ chấp nhận TOTP
    if (user.totpSecret) {
      if (!body.totpCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Tài khoản có bật 2FA, vui lòng nhập mã từ ứng dụng xác thực',
            path: 'totpCode',
          },
        ])
      }

      // Xóa field code nếu có (tránh dùng cả hai)
      if (body.code) {
        throw new UnprocessableEntityException([
          {
            field: 'Tài khoản 2FA chỉ sử dụng mã từ ứng dụng xác thực',
            error: 'code',
          },
        ])
      }

      const TOTPIsValid = await this.twoFactorAuthService.verifyTOTP({
        email: user.email,
        secret: user.totpSecret,
        token: body.totpCode,
      })

      if (!TOTPIsValid) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã 2FA không hợp lệ',
            path: 'totpCode',
          },
        ])
      }
    }
    // FORM 2: User không có 2FA → chỉ chấp nhận OTP email
    else {
      if (!body.code) {
        throw new UnprocessableEntityException([
          {
            message: 'Vui lòng nhập mã OTP từ email',
            path: 'code',
          },
        ])
      }

      // Xóa field totpCode nếu có (tránh dùng cả hai)
      if (body.totpCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Tài khoản chưa bật 2FA, vui lòng sử dụng mã OTP từ email',
            path: 'totpCode',
          },
        ])
      }

      const isValid = await this.validateVerificationCode({
        email: user.email,
        code: body.code,
        type: TypeofVerificationCode.LOGIN,
      })

      if (!isValid) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
            path: 'code',
          },
        ])
      }
    }
    await this.redis.del(`login-temp:${body.tempToken}`)

    // lưu userId, địa chỉ ip, userAgent là kiểu mo tả thiết bị của bạn đang sử dụng phần mềm nào ....
    const device = await this.authRespository.createDevice({
      userId: user.id,
      ip: body.ip,
      userAgent: body.userAgent,
    })

    // tạo ra accesstoken và refreshtoken
    const tokens = await this.generateToken({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })

    return tokens
  }

  async generateToken(payload: AccessTokenPayLoadCreate) {
    // dùng promise. all để chạy 2 cái cùng lúc ko cần dùng await
    const [accessToken, refreshToken] = await Promise.all([
      // tạo accesstoken
      this.tokenService.signAccessToken({
        userId: payload.userId,
        deviceId: payload.deviceId,
        roleId: payload.roleId,
        roleName: payload.roleName,
      }),

      // tạo refreshtoken
      this.tokenService.signRefeshToken({ userId: payload.userId }),
    ])

    // kiểm tra refresh token có hợp lệ không
    const decodedRefrestoken = await this.tokenService.verifyRefreshToken(refreshToken)

    // tạo lại refresh token
    await this.authRespository.createRefreshToken({
      token: refreshToken,
      userId: payload.userId,
      expiresAt: new Date(decodedRefrestoken.exp * 1000),
      deviceId: payload.deviceId,
    })

    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, ip, userAgent }: RefreshTokenBodyDTO & { ip: string; userAgent: string }) {
    try {
      // kiển tra refreshToken để kiểm tra hợp lệ và lấy ra userId
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      // kiển tra refreshToken tồn tại trong database ko
      const ref = await this.authRespository.findUniqueRefreshTokenInlcudeUserRole({
        token: refreshToken,
      })

      // nếu token ko tồn tại =>> nó đã bị revoked hoặc đánh cắp
      if (!ref) {
        throw new UnauthorizedException('Refresh token dẫ bị thu hồi')
      }

      const device = await this.authRespository.findDeviceById(ref.deviceId)

      if (device.ip !== ip || device.userAgent !== userAgent) {
        // nếu khác IP hoặc UA, nghi ngờ bị đánh cắp
        // có lẽ phải là gửi email khi có người đnagw nhập đến nếu không cùng địa chỉ ip
        await this.authRespository.revokeAllRefreshTokens(ref.userId)
        throw new UnauthorizedException('Phát hiện thiết bị lạ, vui lòng đăng nhập lại')
      }
      // lấy thông tin deviceId , roleId, rolName
      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
      } = ref

      // update device
      await this.authRespository.updateDevice(deviceId, {
        ip,
        userAgent,
      })

      // xóa đi refresh token cữ nên mới có lỗi trễn
      await this.authRespository.deleteRefreshToken({
        token: refreshToken,
      })

      const tokens = await this.generateToken({
        userId,
        deviceId,
        roleId,
        roleName,
      })
      return tokens
    } catch (error) {
      console.error('[AuthService:RefreshToken]', error)
      throw error
    }
  }

  async logout(refreshToken: string) {
    try {
      // kiển tra token có đúng ko
      await this.tokenService.verifyRefreshToken(refreshToken)

      // kiển tra token có trong db ko
      await this.authRespository.findUniqueRefreshTokenInlcudeUserRole({ token: refreshToken })

      // xóa refreshToekn
      const ref = await this.authRespository.deleteRefreshToken({
        token: refreshToken,
      })

      // cập nhật lại device
      await this.authRespository.updateDevice(ref.deviceId, {
        isActive: false,
      })

      return { message: 'Logout successful' }
    } catch (error) {
      // refeshtoken bị đánh cắp
      if (isRecordNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token đã đc sử dụng')
      }
      throw new UnauthorizedException()
    }
  }

  async forgotPassword(body: ForgotPasswordType) {
    try {
      // kiểm tra email có tồn tại không
      const existedEmail = await this.authRespository.findUniqueUserIncludeRole({ email: body.email })

      if (!existedEmail) {
        throw new UnauthorizedException('Email không tồn tại')
      }

      const userId = existedEmail.id

      //  1. Kiểm tra user đã có phiên chưa
      const oldTempToken = await this.redis.get(`${TypeTempRedis.FORGOT_PASSWORD_USER}:${userId}`)

      if (oldTempToken) {
        // Kiểm tra session còn tồn tại không
        const session = await this.redis.get(`${TypeTempRedis.FORGOT_PASSWORD_TEMP}:${oldTempToken}`)

        if (session) {
          // Vẫn còn phiên → trả về phiên cũ
          return {
            tempToken: oldTempToken,
          }
        }
      }
      const tempToken = crypto.randomUUID()

      await this.redis.set(
        `${TypeTempRedis.FORGOT_PASSWORD_TEMP}:${tempToken}`,
        JSON.stringify({ userId: existedEmail.id }),
        {
          EX: 300,
        },
      )

      // lưu session theo userId
      await this.redis.set(`${TypeTempRedis.FORGOT_PASSWORD_USER}:${userId}`, tempToken, { EX: 300 })

      return {
        tempToken,
      }
    } catch (error) {
      console.error('[AuthService:ForgotPassword]', error)
      throw error
    }
  }

  async verifyResetCode(body: VerifyResetCodeBodyType) {
    try {
      const temp = await this.redis.get(`${TypeTempRedis.FORGOT_PASSWORD_TEMP}:${body.tempToken}`)

      if (!temp) {
        throw new UnprocessableEntityException([
          {
            message: 'Phiên Forgot Password hết hạn hoặc không hợp lệ',
            path: 'tempToken',
          },
        ])
      }

      const isValid = await this.validateVerificationCode({
        email: body.email,
        code: body.code,
        type: TypeofVerificationCode.FORGOT_PASSWORD,
      })

      if (!isValid) {
        throw new UnprocessableEntityException([
          {
            message: 'Mã OTP không hợp lệ hoặc đã hết hạn',
            path: 'code',
          },
        ])
      }

      await this.authRespository.deleleVerificationCode({
        email_code_type: {
          email: body.email,
          code: body.code,
          type: TypeofVerificationCode.FORGOT_PASSWORD,
        },
      })

      return {
        message: 'Mã đã được xác minh!',
      }
    } catch (error) {
      console.error('[AuthService:verifyOTPCode]', error)
      throw error
    }
  }

  async resetPassword(body: ResetPasswordBodyType) {
    try {
      const { newPassword, confirmNewPassword, email, tempToken } = body

      if (confirmNewPassword !== newPassword) {
        throw new BadRequestException('Mật khẩu xác nhận không khớp')
      }

      const temp = await this.redis.get(`${TypeTempRedis.FORGOT_PASSWORD_TEMP}:${tempToken}`)
      if (!temp) {
        throw new UnprocessableEntityException([
          {
            message: 'Phiên Forgot Password hết hạn hoặc không hợp lệ',
            path: 'tempToken',
          },
        ])
      }

      // hash password
      const hashedPassword = await this.hashingService.hash(body.newPassword)

      // update password
      await this.authRespository.updateUser(
        {
          email: email,
        },
        { password: hashedPassword },
      )

      await this.redis.del(`${TypeTempRedis.FORGOT_PASSWORD_TEMP}:${body.tempToken}`)

      return {
        message: 'Thay đổi mật khẩu thành công thành công',
      }
    } catch (error) {
      console.error('[AuthService:resetPassword]', error)
      throw error
    }
  }

  async setUpTwoFactorAuth(userId: number) {
    try {
      // láy thông tin user, kiểm tra xem user có tồn tại không, có bật 2fa chưa
      const user = await this.authRespository.findUniqueUserIncludeRole({ id: userId })

      if (!user) {
        throw new UnauthorizedException('Email không tồn tại')
      }

      if (user.totpSecret) {
        throw new UnauthorizedException('TotpSecret đã tồn tại')
      }

      // tạo ra secret và uri
      const { totp, uri } = await this.twoFactorAuthService.generateTOTPSecret(user.email)

      // câp nhật secret vào user trong db
      await this.authRespository.updateUser({ id: user.id }, { totpSecret: totp })

      // trả về secret và uri
      return { secret: totp, uri }
    } catch (error) {
      console.error('[AuthService:SetUpTwoFactorAuth]', error)
      throw error
    }
  }
  async disableTwoFactorAuth(body: DisableTwoFactorBodyType, userId: number) {
    try {
      // 1. kiểm tra bằng id bằng accesstoken xem coi có tồn tại không, kiểm tra password, totpsecret có tồn tại không
      const user = await this.authRespository.findUniqueUserIncludeRole({ id: userId })

      if (!user) {
        throw new UnauthorizedException('Không xác định được người dùng từ AccessToken')
      }

      const token = body.totpCode || body.code

      if (!token) {
        throw new UnprocessableEntityException([
          {
            message: 'Thiếu TOTP Secret hoặc OTP code',
            path: 'code, totpCode',
          },
        ])
      }

      const passwordMatch = await this.hashingService.compare(body.password, user.password)

      if (!passwordMatch) {
        throw new UnprocessableEntityException([{ message: 'Mật khẩu bạn nhập không chính xác', path: 'password' }])
      }

      if (!user.totpSecret) {
        throw new UnprocessableEntityException([
          {
            message: 'Xác thực 2FA của bạn chưa được kích hoạt',
            path: 'totpSecret',
          },
        ])
      }

      // 2. kiểm tra tính hợp lệ của OTP code hoặc IOTP Code
      if (body.totpCode) {
        const TOTPIsvaild = await this.twoFactorAuthService.verifyTOTP({
          email: user.email,
          secret: user.totpSecret,
          token: body.totpCode,
        })

        if (!TOTPIsvaild) {
          throw new UnprocessableEntityException([
            {
              message: '2FA không hợp lệ',
              path: 'totpCode',
            },
          ])
        }
      } else if (body.code) {
        await this.validateVerificationCode({
          email: user.email,
          code: body.code,
          type: TypeofVerificationCode.DISABLE_2FA,
        })
      }

      // 3. Cập nhật thông tin
      await this.authRespository.updateUser(
        {
          email: user.email,
        },
        {
          totpSecret: null,
        },
      )

      // 4. Thông báo thông tin
      return {
        message: 'Xóa mã xác nhận 2FA thành công',
      }
    } catch (error) {
      console.error('[AuthService:DisableTwoFactorAuth]', error)
      throw error
    }
  }
}
