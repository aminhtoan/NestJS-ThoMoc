import { Body, ForbiddenException, Get, Post, Query } from '@nestjs/common'
// webhook.controller.ts

import { Controller } from '@nestjs/common'
import { IsPublic } from 'src/shared/decorators/auth.decorator'

// webhook.controller.ts
@Controller('webhook')
export class WebhookController {
  @Get('facebook')
  @IsPublic()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
  ) {
    console.log('Facebook đang verify webhook...')

    // YOUR_VERIFY_TOKEN là mã bạn đặt (giống với mã trong ô "Xác minh mã")
    const YOUR_VERIFY_TOKEN = 'my_facebook_token_123'

    if (mode === 'subscribe' && verifyToken === YOUR_VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully!')
      return challenge // Trả về challenge code cho Facebook
    }

    console.log('❌ Webhook verification failed')
    throw new ForbiddenException('Webhook verification failed')
  }

  @Post('facebook')
  @IsPublic()
  handleWebhook(@Body() body: any) {
    console.log('📨 Webhook received:', body)
    return { status: 'ok' }
  }
}
