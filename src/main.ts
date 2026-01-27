import envConfig from 'src/shared/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { WebsocketAdapter } from './websockets/websocket.adapter'
const ngrok = require('ngrok')

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')
  app.useWebSocketAdapter(new WebsocketAdapter(app))
  // const config = new DocumentBuilder()
  //   .setTitle('NestJS E-commerce')
  //   .setDescription('The E-commerce API description')
  //   .setVersion('1.0')
  //   .build()
  // const documentFactory = () => SwaggerModule.createDocument(app, config)
  // SwaggerModule.setup('swagger', app, documentFactory)

  app.enableCors({
    origin: '*', // địa chỉ của Next.js
    credentials: true,
  })

  await app.listen(process.env.PORT, '0.0.0.0')
  console.log(`✅ Server listening on http://localhost:${process.env.PORT}`)
  // console.log(`✅ Swagger listening on http://localhost:${process.env.PORT}/swagger`)
}
bootstrap()
