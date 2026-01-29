import { Module } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageController } from './message.controller'
import { MessageRespository } from './message.repo'

@Module({
  controllers: [MessageController],
  providers: [MessageService, MessageRespository],
})
export class MessageModule {}
