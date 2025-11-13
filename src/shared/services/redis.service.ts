import { createClient } from 'redis'
import { Provider } from '@nestjs/common'
import envConfig from '../config'
import { RedisName } from '../constants/redis.constant'

export const REDIS_CLIENT = RedisName.REDIS_CLIENT

export const RedisServices: Provider = {
  provide: REDIS_CLIENT,
  useFactory: async () => {
    const client = createClient({
      username: envConfig.REDIS_USERNAME,
      password: envConfig.REDIS_PASSWORD,
      socket: {
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
      },
      RESP: 3,
      clientSideCache: {
        ttl: 0,
        maxEntries: 0,
        evictPolicy: 'LRU',
      },
    })

    client.on('error', (err) => console.error('❌ Redis error:', err))
    await client.connect()

    console.log('Redis connected!')
    return client
  },
}
