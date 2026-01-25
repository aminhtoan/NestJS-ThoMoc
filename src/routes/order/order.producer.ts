import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'
import { CANCLE_PAYMENT_queue_name, PAYMENT_queue_name } from 'src/shared/constants/payment.constant'

@Injectable()
export class OrderProducer {
  constructor(@InjectQueue(PAYMENT_queue_name) private audioQueue: Queue) {}

  // trong vong 24 gio khong thanh toan thi huy don hang
  async canclePayment(paymentId: string) {
    await this.audioQueue.add(
      CANCLE_PAYMENT_queue_name,
      {
        paymentId,
      },
      {
        delay: 1 * 24 * 60 * 60 * 1000, // 24h
        attempts: 5, // so lan thu lai
        backoff: {
          type: 'exponential', // Kiểu lùi theo hàm mũ
          delay: 5000, // Bắt đầu chờ 5s (5s -> 10s -> 20s -> 40s -> 80s)
        },
        jobId: `cancle-payment-${paymentId}`, // unique id de tranh trung lap
        removeOnComplete: true,
        removeOnFail: false,
      },
    )
  }
}
