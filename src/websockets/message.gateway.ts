import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { generateRoom } from 'src/shared/helpers'
import { MessageRespository } from 'src/shared/repositories/shared-message.repo'
import { TokenService } from 'src/shared/services/token.service'

@WebSocketGateway({ namespace: '/chat' })
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(
    private readonly messageRespository: MessageRespository,
    private readonly tokenService: TokenService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization
      if (!authHeader) {
        client.disconnect()
        return
      }

      const token = authHeader.split(' ')[1]
      const { userId } = await this.tokenService.verifyAccessToken(token)

      if (!userId) {
        client.disconnect()
        return
      }

      client.data.userId = userId

      client.join(generateRoom(userId))
      // console.log(`🟢 User ${userId} connected`)
    } catch (err) {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`🔴 Client disconnected`)
  }

  // ===== SEND MESSAGE =====
  @SubscribeMessage('message:send')
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      toUserId: number
      content: string
    },
  ) {
    const fromUserId = client.data.userId

    //Lưu DB
    const message = await this.messageRespository.createMessage(payload, fromUserId)

    //Emit cho người nhận
    this.server.to(generateRoom(payload.toUserId)).emit('message:receive', message)

    // Emit lại cho người gửi (sync UI)
    // this.server.to(generateRoom(fromUserId)).emit('message:receive', message)

    return message
  }

  @SubscribeMessage('message:read')
  async readMessage(@ConnectedSocket() client: Socket, @MessageBody() payload: { fromUserId: number }) {
    const toUserId = client.data.userId // người đang đọc, userId này lấy ra thì accestoken, và sẻ gửi đã seen
    const fromUserId = payload.fromUserId // người gửi tin, cái này là client của fe gửi xuiosong
    console.log(toUserId, fromUserId)

    // cập nhật DB
    await this.messageRespository.markAsRead(toUserId, fromUserId)

    // báo cho người gửi biết là đã seen
    this.server.to(generateRoom(fromUserId)).emit('message:seen', {
      fromUserId,
      toUserId,
    })
  }
}
