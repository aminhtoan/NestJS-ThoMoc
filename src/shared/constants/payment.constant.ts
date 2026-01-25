export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const

export const PAYMENT_CODE = 'TJOXO'
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const PAYMENT_queue_name = 'payment_queue'
export const CANCLE_PAYMENT_queue_name = 'cancle_payment_queue'
