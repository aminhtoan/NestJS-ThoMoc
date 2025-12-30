import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import { Prisma } from '@prisma/client'

export function isUniqueConstraintError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isRecordNotFoundError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025'
}

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
