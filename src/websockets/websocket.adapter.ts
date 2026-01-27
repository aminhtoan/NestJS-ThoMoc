import { INestApplicationContext } from '@nestjs/common'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createClient } from 'redis'
import { ServerOptions, Server, Socket } from 'socket.io'
import { generateRoom } from 'src/shared/helpers'
import { WebsocketsRepo } from 'src/shared/repositories/shared-websocket.repo'
import { TokenService } from 'src/shared/services/token.service'
import { createAdapter } from '@socket.io/redis-adapter'
import envConfig from 'src/shared/config'

export class WebsocketAdapter extends IoAdapter {
  private readonly websocketsRepo: WebsocketsRepo
  private readonly tokenService: TokenService
  private adapterConstructor: ReturnType<typeof createAdapter>

  constructor(app: INestApplicationContext) {
    super(app)
    this.tokenService = app.get(TokenService)
    this.websocketsRepo = app.get(WebsocketsRepo)
  }

  async connectToRedis(): Promise<void> {
    const redisUrl = `redis://${envConfig.REDIS_USERNAME}:${envConfig.REDIS_PASSWORD}@${envConfig.REDIS_HOST}:${envConfig.REDIS_PORT}`
    const pubClient = createClient({ url: redisUrl })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const portToUse = port === 0 ? 1412 : port

    const server: Server = super.createIOServer(portToUse, {
      ...options,
      cors: {
        origin: 'http://localhost:3000',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    })

    // Wrapper để giữ context 'this'
    const middlewareWrapper = (socket: Socket, next: (err?: any) => void) => {
      this.authMiddleware(socket, next)
    }

    server.use(middlewareWrapper)
    server.of(/.*/).use(middlewareWrapper)

    return server
  }

  async authMiddleware(socket: Socket, next: (err?: any) => void) {
    try {
      const { authorization } = socket.handshake.headers

      if (!authorization) {
        // Ném lỗi về client
        return next(new Error('Missing Authorization Header'))
      }

      const accessToken = authorization.split(' ')[1]
      if (!accessToken) {
        return next(new Error('Missing Access Token'))
      }

      // Lúc này this.tokenService đã có dữ liệu nhờ constructor fix bên trên
      const { userId } = await this.tokenService.verifyAccessToken(accessToken)

      await socket.join(generateRoom(userId))

      //   // Lưu socket id vào DB
      //   await this.websocketsRepo.createWebsocket({
      //     id: socket.id,
      //     userId: userId,
      //   })

      //   // Lưu userId vào socket để dùng sau này (trong Gateway)
      // @ts-ignorex
      //   socket.userId = userId

      //   // Xử lý disconnect:
      //   socket.on('disconnect', () => {
      //     this.websocketsRepo.deleteWebsocket(socket.id).catch((err) => console.error(err))
      //   })

      return next()
    } catch (error) {
      console.error('Socket Auth Error:', error.message)
      return next(new Error('Unauthorized: ' + error.message))
    }
  }
}
