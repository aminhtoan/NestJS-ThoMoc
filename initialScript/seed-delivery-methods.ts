import { NestFactory } from '@nestjs/core'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/shared/services/prisma.service'

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule)
  const prisma = app.get(PrismaService)

  try {
    const deliveryMethods = [
      {
        name: 'Giao hàng tiêu chuẩn',
        code: 'STANDARD',
        price: 15000,
        description: 'Giao hàng trong 3-5 ngày',
        isActive: true,
      },
      {
        name: 'Giao hàng nhanh',
        code: 'EXPRESS',
        price: 30000,
        description: 'Giao hàng trong 1-2 ngày',
        isActive: true,
      },
      {
        name: 'Giao hỏa tốc',
        code: 'SAME_DAY',
        price: 50000,
        description: 'Giao trong ngày',
        isActive: true,
      },
      {
        name: 'Miễn phí vận chuyển',
        code: 'FREE_SHIPPING',
        price: 0,
        description: 'Áp dụng cho đơn hàng trên 500k',
        isActive: true,
      },
      {
        name: 'Giao tiết kiệm',
        code: 'ECONOMY',
        price: 10000,
        description: 'Giao hàng 5-7 ngày',
        isActive: false,
      },
    ]

    for (const method of deliveryMethods) {
      const existing = await prisma.deliveryMethod.findUnique({
        where: { code: method.code },
      })

      if (existing) {
        console.log(`⏭ Bỏ qua (đã tồn tại): ${method.name}`)
        continue
      }

      await prisma.deliveryMethod.create({
        data: method,
      })

      console.log(`Đã tạo: ${method.name}`)
    }

    console.log('Delivery methods seeding completed!')
  } catch (error) {
    console.error('Error seeding delivery methods:', error)
  } finally {
    await app.close()
    process.exit(0)
  }
}

bootstrap()
