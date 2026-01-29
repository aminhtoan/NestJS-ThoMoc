import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { MessageCreatebodyType, MessageType } from '../models/shared-message.model'

@Injectable()
export class MessageRespository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Gửi tin nhắn
   */
  async createMessage(data: MessageCreatebodyType, userId: number): Promise<MessageType> {
    return this.prismaService.message.create({
      data: {
        fromUserId: userId,
        toUserId: data.toUserId,
        content: data.content,
      },
    })
  }

  /**
   * Lấy lịch sử chat giữa 2 user
   */
  async getConversation(userId1: number, userId2: number): Promise<MessageType[]> {
    return this.prismaService.message.findMany({
      where: {
        OR: [
          {
            fromUserId: userId1,
            toUserId: userId2,
          },
          {
            fromUserId: userId2,
            toUserId: userId1,
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
  }

  /**
   * Lấy tất cả tin nhắn của 1 user
   */
  async getAllMessageOfUser(userId: number): Promise<MessageType[]> {
    return this.prismaService.message.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Đánh dấu đã đọc tin nhắn
   * (khi user mở cuộc trò chuyện)
   */
  async markAsRead(fromUserId: number, toUserId: number) {
    return this.prismaService.message.updateMany({
      where: {
        fromUserId,
        toUserId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })
  }

  /**
   * Đếm số tin chưa đọc
   */
  async countUnread(userId: number): Promise<number> {
    return this.prismaService.message.count({
      where: {
        toUserId: userId,
        readAt: null,
      },
    })
  }
}
