import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common'
import { MessageService } from './message.service'
import { MessageCreatebodyDTO, ToUserParamsDTO } from './message.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { CONFIGURABLE_MODULE_ID } from '@nestjs/common/module-utils/constants'

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async createMessage(@Body() body: MessageCreatebodyDTO, @ActiveUser('userId') userId: number) {
    return this.messageService.createMessage(body, userId)
  }

  @Get('/messages/conversation/:userId')
  async getConversation(@ActiveUser('userId') userId: number, @Param() params: ToUserParamsDTO) {
    return this.messageService.getConversation(userId, params.userId)
  }

  @Get('/messages')
  async getAllMessageOfUser(@ActiveUser('userId') userId: number) {
    return this.messageService.getAllMessageOfUser(userId)
  }

  @Patch('/messages/read/from/:userId')
  async markAsRead(@ActiveUser('userId') userId: number, @Param() params: ToUserParamsDTO) {
    return this.messageService.markAsRead(userId, params.userId)
  }

  @Get('/messages/unread/count')
  async countUnread(@ActiveUser('userId') userId: number) {
    return this.messageService.countUnread(userId)
  }

  @Get('/messages/conversations/list')
  async getConversationList(@ActiveUser('userId') userId: number) {
    return this.messageService.getConversationList(userId)
  }
}
