import { Injectable } from '@nestjs/common'
import { MessageCreatebodyType } from './message.model'
import { MessageRespository } from './message.repo'

@Injectable()
export class MessageService {
  constructor(private readonly messageRespository: MessageRespository) {}

  async createMessage(body: MessageCreatebodyType, userId: number) {
    try {
      const data = await this.messageRespository.createMessage(body, userId)

      return data
    } catch (error) {
      throw error
    }
  }

  async getConversation(userId1: number, userId2: number) {
    console.log(userId1, userId2)
    try {
      return await this.messageRespository.getConversation(userId1, userId2)
    } catch (error) {
      throw error
    }
  }

  async getAllMessageOfUser(userId: number) {
    try {
      return await this.messageRespository.getAllMessageOfUser(userId)
    } catch (error) {
      throw error
    }
  }

  async markAsRead(fromUserId: number, toUserId: number) {
    try {
      return await this.messageRespository.markAsRead(fromUserId, toUserId)
    } catch (error) {
      throw error
    }
  }

  async countUnread(userId: number) {
    try {
      return await this.messageRespository.countUnread(userId)
    } catch (error) {
      throw error
    }
  }

  async getConversationList(userId: number) {
    try {
      return await this.messageRespository.getConversationList(userId)
    } catch (error) {
      throw error
    }
  }
}
