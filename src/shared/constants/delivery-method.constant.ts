export const DeliveryMethodCode = {
  STANDARD: 'STANDARD',
  EXPRESS: 'EXPRESS',
  SAME_DAY: 'SAME_DAY',
  ECONOMY: 'ECONOMY',
} as const

export type DeliveryMethodCodeType = (typeof DeliveryMethodCode)[keyof typeof DeliveryMethodCode]
