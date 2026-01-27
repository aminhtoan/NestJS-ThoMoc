import { Injectable } from '@nestjs/common'
import { PrismaService } from '../services/prisma.service'

@Injectable()
export class WebsocketsRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async createWebsocket(data: { id: string; userId: number }) {
    return await this.prismaService.websocket.create({
      data: {
        id: data.id,
        userId: data.userId,
      },
    })
  }

  deleteWebsocket(id: string) {
    return this.prismaService.websocket.delete({
      where: {
        id: id,
      },
    })
  }

  findWebsocket(userId: number) {
    return this.prismaService.websocket.findMany({
      where: {
        userId,
      },
    })
  }
}
