import { HTTPsMethod, HTTPsMethodType } from 'src/shared/constants/role.constant'
// Source - https://stackoverflow.com/a/63333671
// Posted by oviniciusfeitosa, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-31, License - CC BY-SA 4.0

import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { PrismaService } from 'src/shared/services/prisma.service'

interface Routes {
  name: string
  description: string
  path: string
  method: HTTPsMethodType
}
async function bootstrap() {
  const prisma = new PrismaService()
  const existingCount = await prisma.permission.count()
  const app = await NestFactory.create(AppModule)
  await app.listen(3000)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  console.log(`Hiện có ${existingCount} permissions trong DB`)

  const availableRoutes: [] = router.stack
    .map((layer) => {
      if (layer.route) {
        return {
          path: layer.route?.path,
          method: String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPsMethod,
        }
      }
    })
    .filter((item) => item !== undefined)

  const permissions = availableRoutes.map((route: Routes) => ({
    name: `${route.method} ${route.path}`,
    description: `Access to ${route.method} ${route.path}`,
    path: route.path,
    method: route.method,
  }))

  console.log(`Tìm thấy ${permissions.length} routes`)

  try {
    const result = await prisma.permission.createMany({
      data: permissions,
      skipDuplicates: true,
    })
    console.log(`Đã tạo ${result.count} permissions mới`)
    console.log(`Bỏ qua ${permissions.length - result.count} permissions đã tồn tại`)
  } catch (error) {
    console.log('[Erorr:Create-Permisson]: ', error)
    process.exit(1)
  } finally {
    await app.close()
    process.exit(0)
  }
}
bootstrap()
