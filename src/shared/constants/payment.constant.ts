export const PaymentStatus = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const

export const PaymentMethodCode = {
  COD: 'COD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  E_WALLET: 'E_WALLET',
  CREDIT_CARD: 'CREDIT_CARD',
  DEBIT_CARD: 'DEBIT_CARD',
} as const

export const PAYMENT_CODE = 'TJOXO'
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus]
export type PaymentMethodCodeType = (typeof PaymentMethodCode)[keyof typeof PaymentMethodCode]

export const PAYMENT_queue_name = 'payment_queue'
export const CANCLE_PAYMENT_queue_name = 'cancle_payment_queue'
