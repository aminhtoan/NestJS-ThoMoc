import { createZodDto } from 'nestjs-zod'
import { MessageCreatebodySchema, MessageSchema, ToUserParams } from './message.model'

export class MessageDTO extends createZodDto(MessageSchema) {}
export class MessageCreatebodyDTO extends createZodDto(MessageCreatebodySchema) {}
export class ToUserParamsDTO extends createZodDto(ToUserParams) {}
