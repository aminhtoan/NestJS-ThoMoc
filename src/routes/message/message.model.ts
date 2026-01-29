import z from 'zod'

export const MessageSchema = z.object({
  id: z.number(),
  fromUserId: z.number(),
  toUserId: z.number(),
  content: z.string().min(1).max(1000),
  readAt: z.date().optional(),
  createdAt: z.date(),
})

export const MessageCreatebodySchema = MessageSchema.pick({
  toUserId: true,
  content: true,
}).strict()

export const GetAllMessage = z.object({
  data: z.array(MessageSchema),
})

export const ToUserParams = z.object({
  userId: z.coerce.number().int().positive(),
})

export type MessageType = z.infer<typeof MessageSchema>
export type MessageCreatebodyType = z.infer<typeof MessageCreatebodySchema>
export type GetAllMessageType = z.infer<typeof GetAllMessage>
