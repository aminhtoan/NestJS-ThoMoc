import { Module } from '@nestjs/common'
import { WebsocketsService } from './websockets.service'
import { WebsocketsController } from './websockets.controller'
import { ChatGateway } from './chat.gateway'
import { PaymentGateway } from './payment.gateway'

@Module({
  controllers: [WebsocketsController],
  providers: [WebsocketsService, ChatGateway, PaymentGateway],
})
export class WebsocketsModule {}
