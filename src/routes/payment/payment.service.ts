import { WebsocketsRepo } from './../../shared/repositories/shared-websocket.repo'
import { Injectable } from '@nestjs/common'
import { PaymentStatusRepository } from './payment.repo'
import { WebhookPaymentType } from './payment.model'
import { OrderProducer } from '../order/order.producer'
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'
import { generateRoom } from 'src/shared/helpers'

@Injectable()
@WebSocketGateway({ namespace: '/payment' })
export class PaymentService {
  constructor(
    private readonly paymentStatusRepository: PaymentStatusRepository,
    private orderProducer: OrderProducer,
    private readonly websocketsRepo: WebsocketsRepo,
  ) {}
  @WebSocketServer()
  server: Server
  async receiver(body: WebhookPaymentType) {
    const data = await this.paymentStatusRepository.receiver(body)

    this.server.to(generateRoom(data.userId)).emit('payment', {
      status: 'success',
    })

    if (!data.paymentId) {
      return {
        message: data.message,
      }
    }

    try {
      await this.orderProducer.removeCancelPaymentJob(data.paymentId.toString())
    } catch (err) {
      console.error(`Failed to remove cancel-payment job, paymentId=${data.paymentId}`, err)
    }
    //   const websocket = await this.websocketsRepo.findWebsocket(data.userId)
    //   websocket.forEach((ws) => {
    //     this.server.to(ws.id).emit('payment', {
    //       status: 'success',
    //     })
    //   })
    // } catch (error) {
    //   console.error(error)
    // }
    return {
      message: data.message,
    }
  }

  async createQR(amount: number, description: string) {
    //description ờ đây là gì? là mã payment code và số paymentId, TJOXO + 12 => TJOXO12
    const qr = `https://qr.sepay.vn/img?acc=0932682977&bank=MBBank&amount=${amount}&des=${description}`
    return qr
  }
}
