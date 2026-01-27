import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { WebsocketAdapter } from './websockets/websocket.adapter'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
const ngrok = require('ngrok')

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.setGlobalPrefix('api')
  const redisIoAdapter = new WebsocketAdapter(app)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)

  app.enableCors({
    origin: '*', // địa chỉ của Next.js
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('NestJS E-commerce')
    .setDescription('The E-commerce API description')
    .setVersion('1.0')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, documentFactory)
  
  await app.listen(process.env.PORT, '0.0.0.0')
  console.log(`✅ Server listening on http://localhost:${process.env.PORT}`)
  console.log(`✅ Swagger listening on http://localhost:${process.env.PORT}/swagger`)
}
bootstrap()
