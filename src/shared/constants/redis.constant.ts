export const RedisName = {
  REDIS_CLIENT: 'REDIS_CLIENT',
} as const

export const TypeTempRedis = {
  FORGOT_PASSWORD_TEMP: 'forgot-password-temp',
  FORGOT_PASSWORD_USER: 'FORGOT_PASSWORD_USER',
}

export type TypeTempRedisType = (typeof TypeTempRedis)[keyof typeof TypeTempRedis]
