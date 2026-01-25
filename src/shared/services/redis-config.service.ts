import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common'
import Redis from 'ioredis'
import envConfig from '../config'

@Injectable()
export class RedisConfigService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisConfigService.name)
  private redis: Redis

  async onModuleInit() {
    await this.checkAndSetEvictionPolicy()
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit()
    }
  }

  private async checkAndSetEvictionPolicy() {
    try {
      // Tạo connection riêng để check config
      this.redis = new Redis({
        host: envConfig.REDIS_HOST,
        port: envConfig.REDIS_PORT,
        username: envConfig.REDIS_USERNAME,
        password: envConfig.REDIS_PASSWORD,
        retryStrategy: () => null, // Không retry nếu fail
      })

      // Check current eviction policy
      const currentPolicy = await this.redis.config('GET', 'maxmemory-policy')
      const policyValue = Array.isArray(currentPolicy) ? currentPolicy[1] : currentPolicy

      this.logger.log(`Current Redis eviction policy: ${policyValue}`)

      if (policyValue !== 'noeviction') {
        this.logger.warn('⚠️ IMPORTANT! Eviction policy is not "noeviction"')
        this.logger.warn(`Current policy: ${policyValue}`)
        this.logger.warn('⚠️ This can cause job queue data loss!')

        try {
          // Try to set eviction policy to noeviction
          await this.redis.config('SET', 'maxmemory-policy', 'noeviction')
          this.logger.log('✅ Successfully set eviction policy to "noeviction"')
        } catch (error) {
          this.logger.error('❌ Failed to set eviction policy:', error.message)
          this.logger.error(
            '⚠️ Please set eviction policy to "noeviction" manually in Redis config or Redis Cloud dashboard',
          )
          this.logger.error('⚠️ Command: CONFIG SET maxmemory-policy noeviction')
          this.logger.error('⚠️ For Redis Cloud: Go to Configuration → Advanced Settings → Eviction Policy')
        }
      } else {
        this.logger.log('✅ Redis eviction policy is correctly set to "noeviction"')
      }
    } catch (error) {
      this.logger.error('❌ Error checking Redis eviction policy:', error.message)
      this.logger.warn(
        '⚠️ Please manually verify that Redis eviction policy is set to "noeviction"',
      )
      this.logger.warn('⚠️ For Redis Cloud: Go to Configuration → Advanced Settings → Eviction Policy')
    } finally {
      if (this.redis) {
        await this.redis.quit()
      }
    }
  }
}
