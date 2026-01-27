import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import envConfig from 'src/shared/config'

@WebSocketGateway({ namespace: '/payment' })
export class PaymentGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('send-money')
  handleEvent(@MessageBody() data: string): string {
    this.server.emit('receive-money', {
      data: `Money: ${data}`,
    })

    return data
  }
}
