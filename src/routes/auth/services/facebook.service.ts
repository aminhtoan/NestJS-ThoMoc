import { Injectable } from '@nestjs/common'
import envConfig from 'src/shared/config'
import { AuthRespository } from '../repository/auth.repo'
import { RolesService } from './roles.service'
import { AuthService } from './auth.service'
import { HashingService } from 'src/shared/services/hashing.service'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

@Injectable()
export class FacebookService {
  constructor(
    private readonly authRespository: AuthRespository,
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authService: AuthService,
  ) {}

  // Tạo URL cho FE
  getFacebookLink({ ip, userAgent }: { ip: string; userAgent: string }) {
    const state = Buffer.from(JSON.stringify({ ip, userAgent, timestamp: Date.now() })).toString('base64')

    const url = new URL('https://www.facebook.com/v18.0/dialog/oauth')
    url.searchParams.append('client_id', envConfig.FACEBOOK_APP_ID)
    url.searchParams.append('redirect_uri', envConfig.FACEBOOK_CALLBACK_URL)
    url.searchParams.append('state', state)
    url.searchParams.append('response_type', 'code')
    url.searchParams.append('scope', 'email,public_profile')

    return { url: url.toString() }
  }

  async FacebookCallback({ code, state }: { code: string; state: string }) {
    try {
      let ip = 'Unknown'
      let userAgent = 'Unknown'

      // 1) Giải mã state giống Google
      if (state) {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
        ip = decoded.ip
        userAgent = decoded.userAgent
      }

      // 2) Lấy access token từ Facebook
      const tokenRes = await axios.get(`https://graph.facebook.com/v18.0/oauth/access_token`, {
        params: {
          client_id: envConfig.FACEBOOK_APP_ID,
          client_secret: envConfig.FACEBOOK_APP_SECRET,
          redirect_uri: envConfig.FACEBOOK_CALLBACK_URL,
          code,
        },
      })

      const fbAccessToken = tokenRes.data.access_token

      // 3) Lấy thông tin user Facebook
      const userRes = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture`, {
        headers: {
          Authorization: `Bearer ${fbAccessToken}`,
        },
      })

      const fbUser = userRes.data

      if (!fbUser.email) {
        throw new Error('Facebook không trả về email!')
      }

      // 4) Tìm user trong DB
      let user = await this.authRespository.findUniqueUserIncludeRole({
        email: fbUser.email,
      })

      // 5) Nếu chưa có -> tạo user mới
      if (!user) {
        const clientRoleId = await this.rolesService.getClientRoleId()
        const randomPassword = uuidv4()
        const hashPass = await this.hashingService.hash(randomPassword)

        user = await this.authRespository.createUserWithGoogle({
          email: fbUser.email,
          name: fbUser.name ?? '',
          phoneNumber: '',
          roleId: clientRoleId,
          password: hashPass,
          avatar: fbUser.picture?.data?.url ?? null,
        })
      }

      // 6) Lưu thiết bị
      const device = await this.authRespository.createDevice({
        userId: user.id,
        ip: ip,
        userAgent: userAgent,
      })

      // 7) Tạo token giống Google
      const tokens = await this.authService.generateToken({
        userId: user.id,
        deviceId: device.id,
        roleId: user.roleId,
        roleName: user.role.name,
      })

      return tokens
    } catch (err) {
      console.error('[Facebook Auth Error]', err.message)
      throw new Error('Đăng nhập bằng Facebook thất bại')
    }
  }
}
