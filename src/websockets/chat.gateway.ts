import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('send-message') // Lắng nghe sự kiện 'send-message' từ client
  handleEvent(@MessageBody() data: string): string {
    // Phát lại sự kiện 'receive-message' kèm dữ liệu chào hỏi đến tất cả client
    this.server.emit('receive-message', {
      data: `Hello ${data}`, // Sử dụng backticks để nội suy biến data
    })

    return data
  }
}
