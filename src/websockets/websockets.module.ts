import { Module } from '@nestjs/common'
import { WebsocketsService } from './websockets.service'
import { WebsocketsController } from './websockets.controller'
// import { ChatGateway } from './chat.gateway'
import { PaymentGateway } from './payment.gateway'
import { MessageGateway } from './message.gateway'

@Module({
  controllers: [WebsocketsController],
  providers: [WebsocketsService, PaymentGateway, MessageGateway],
})
export class WebsocketsModule {}
