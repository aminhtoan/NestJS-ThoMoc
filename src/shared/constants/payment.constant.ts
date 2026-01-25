export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const

export const PAYMENT_CODE = 'TJOXO'
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus]
