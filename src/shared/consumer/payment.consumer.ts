import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'
import { PAYMENT_queue_name, CANCLE_PAYMENT_queue_name } from 'src/shared/constants/payment.constant'
import { SharedPaymentRepo } from '../repositories/shared-payment.repo'
import { PrismaService } from '../services/prisma.service'
import { PaymentStatus } from '../constants/payment.constant'

@Processor(PAYMENT_queue_name)
export class PaymentConsumer extends WorkerHost {
  constructor(
    private readonly paymentRepo: SharedPaymentRepo,
    private readonly prismaService: PrismaService,
  ) {
    super()
  }

  async process(job: Job<{ paymentId: string | number }, any, string>): Promise<any> {
    switch (job.name) {
      case CANCLE_PAYMENT_queue_name: {
        // Convert paymentId từ string sang number
        const paymentId = typeof job.data.paymentId === 'string' 
          ? Number(job.data.paymentId) 
          : job.data.paymentId

        if (isNaN(paymentId)) {
          console.error('Invalid paymentId:', job.data.paymentId)
          throw new Error('Invalid paymentId')
        }
        
        // Check payment status - chỉ cancel nếu vẫn PENDING
        const payment = await this.prismaService.payment.findUnique({
          where: { id: paymentId },
          select: { id: true, status: true },
        })

        if (!payment) {
          console.log(`Payment ${paymentId} not found, skipping...`)
          return { message: 'Payment not found' }
        }

        if (payment.status !== PaymentStatus.PENDING) {
          console.log(`Payment ${paymentId} status is ${payment.status}, skipping cancel...`)
          return { message: `Payment already ${payment.status}` }
        }

        // Cancel payment và hoàn lại stock
        await this.paymentRepo.celcelPaymentWithOrder(paymentId)
        return { message: 'Payment cancelled successfully' }
      }
      default:
        break
    }
  }
}
