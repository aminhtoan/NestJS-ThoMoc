import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { randomInt } from 'crypto'

export function isUniqueConstraintError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2002'
}

export function isRecordNotFoundError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2025'
}

// p2003
export function isForeignKeyConstraintError(error: any): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError && error.code === 'P2003'
}

export const generateOTP = () => {
  return randomInt(100000, 1000000).toString()
}

export const generateRandomFileName = (fileName: string): string => {
  const ext = path.extname(fileName)
  return `${uuidv4()}${ext}`
}

export const generateRoom = (userId: number) => {
  return `room-${userId}`
}
