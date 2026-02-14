import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/shared/services/prisma.service'
import { PaymentMethodCode } from '../src/shared/constants/payment.constant'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const prisma = app.get(PrismaService)

  try {
    const paymentMethods = [
      {
        name: 'Thanh toán khi nhận hàng (COD)',
        code: PaymentMethodCode.COD,
        isActive: true,
      },
      {
        name: 'Chuyển khoản ngân hàng',
        code: PaymentMethodCode.BANK_TRANSFER,
        isActive: true,
      },
      {
        name: 'Ví điện tử',
        code: PaymentMethodCode.E_WALLET,
        isActive: true,
      },
      {
        name: 'Thẻ tín dụng',
        code: PaymentMethodCode.CREDIT_CARD,
        isActive: false,
      },
      {
        name: 'Thẻ ghi nợ',
        code: PaymentMethodCode.DEBIT_CARD,
        isActive: false,
      },
    ]

    for (const paymentMethod of paymentMethods) {
      const existing = await prisma.paymentMethod.findUnique({
        where: { code: paymentMethod.code },
      })

      if (existing) {
        console.log(`⏭ Bỏ qua (đã tồn tại): ${paymentMethod.name}`)
        continue
      }

      await prisma.paymentMethod.create({
        data: paymentMethod,
      })

      console.log(`Đã tạo: ${paymentMethod.name}`)
    }

    console.log('Payment methods seeding completed!')
  } catch (error) {
    console.error('Error seeding payment methods:', error)
  } finally {
    await app.close()
    process.exit(0)
  }
}

bootstrap()
