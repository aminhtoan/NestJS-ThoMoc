/**
 * Script để tạo dữ liệu mẫu cho PaymentMethod
 * Chạy bằng: npm run seed:payment-methods
 */

import { PrismaClient } from '@prisma/client'
import { exit } from 'process'

const prisma = new PrismaClient()

const paymentMethods = [
  {
    name: 'Thanh toán khi nhận hàng (COD)',
    code: 'COD',
    isActive: true,
  },
  {
    name: 'Chuyển khoản ngân hàng',
    code: 'BANK_TRANSFER',
    isActive: true,
  },
  {
    name: 'Ví điện tử (MoMo, ZaloPay)',
    code: 'E_WALLET',
    isActive: true,
  },
  {
    name: 'Thẻ tín dụng',
    code: 'CREDIT_CARD',
    isActive: false,
  },
  {
    name: 'Thẻ ghi nợ',
    code: 'DEBIT_CARD',
    isActive: false,
  },
]

async function seedPaymentMethods() {
  console.log('🌱 Bắt đầu seed payment methods...')

  try {
    for (const method of paymentMethods) {
      const existing = await prisma.paymentMethod.findFirst({
        where: { code: method.code },
      })

      if (existing) {
        console.log(`⏩ PaymentMethod ${method.code} đã tồn tại, bỏ qua...`)
        continue
      }

      const created = await prisma.paymentMethod.create({
        data: method,
      })

      console.log(`✅ Đã tạo PaymentMethod: ${created.name} (${created.code})`)
    }

    console.log('🎉 Seed payment methods thành công!')
  } catch (error) {
    console.error('❌ Lỗi khi seed payment methods:', error)
    exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Chạy seed function
seedPaymentMethods()
