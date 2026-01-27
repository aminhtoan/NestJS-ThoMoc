import z from 'zod'

export const PaymentTransactionSchema = z.object({
  id: z.number().int(),
  gateway: z.string().max(100),
  transactionDate: z.date(),
  accountNumber: z.string().max(100).nullable().optional(),
  subAccount: z.string().max(250).nullable().optional(),
  amountIn: z.number().int().default(0),
  amountOut: z.number().int().default(0),
  accumulated: z.number().int().default(0),
  code: z.string().max(250).nullable().optional(),
  transactionContent: z.string().nullable().optional(),
  referenceNumber: z.string().max(255).nullable().optional(),
  body: z.string().nullable().optional(),
  createdAt: z.date(),
})

// {
//     "id": 92704,                              // ID giao dịch trên SePay
//     "gateway":"Vietcombank",                  // Brand name của ngân hàng
//     "transactionDate":"2023-03-25 14:02:37",  // Thời gian xảy ra giao dịch phía ngân hàng
//     "accountNumber":"0123499999",              // Số tài khoản ngân hàng
//     "code":null,                               // Mã code thanh toán (sepay tự nhận diện dựa vào cấu hình tại Công ty -> Cấu hình chung)
//     "content":"chuyen tien mua iphone",        // Nội dung chuyển khoản
//     "transferType":"in",                       // Loại giao dịch. in là tiền vào, out là tiền ra
//     "transferAmount":2277000,                  // Số tiền giao dịch
//     "accumulated":19077000,                    // Số dư tài khoản (lũy kế)
//     "subAccount":null,                         // Tài khoản ngân hàng phụ (tài khoản định danh),
//     "referenceCode":"MBVCB.3278907687",         // Mã tham chiếu của tin nhắn sms
//     "description":""                           // Toàn bộ nội dung tin nhắn sms
// }

export const WebhookPaymentSchema = z.object({
  id: z.number().int(),
  gateway: z.string().max(100),
  transactionDate: z.string().max(100),
  accountNumber: z.string().max(100).nullable().optional(),
  subAccount: z.string().max(250).nullable().optional(),
  transferType: z.enum(['in', 'out']),
  transferAmount: z.number().int().default(0),
  accumulated: z.number().int().default(0),
  code: z.string().max(250).nullable().optional(),
  content: z.string().nullable().optional(),
  referenceCode: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
})

export type PaymentTransactionType = z.infer<typeof PaymentTransactionSchema>
export type WebhookPaymentType = z.infer<typeof WebhookPaymentSchema>
