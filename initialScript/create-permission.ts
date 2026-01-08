import { HTTPsMethod, RoleName } from 'src/shared/constants/role.constant'
// Source - https://stackoverflow.com/a/63333671
// Posted by oviniciusfeitosa, modified by community. See post 'Timeline' for change history
// Retrieved 2025-12-31, License - CC BY-SA 4.0

import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { PrismaService } from 'src/shared/services/prisma.service'

async function bootstrap() {
  const prisma = new PrismaService()
  const app = await NestFactory.create(AppModule)
  await app.listen(30010)
  const server = app.getHttpAdapter().getInstance()
  const existingCount = await prisma.permission.count()
  const permissionsInDb = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })
  const router = server.router

  console.log(`Hiện có ${existingCount} permissions trong DB`)

  const availableRoutes: {
    path: string
    method: keyof typeof HTTPsMethod
    name: string
    description: string
    module: string
  }[] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const moduleName = String(path.split('/')[1]).toUpperCase()
        const method = String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPsMethod
        return {
          path,
          method,
          name: method + path,
          description: `Access to ${method} ${path}`,
          module: moduleName,
        }
      }
    })
    .filter((item) => item !== undefined)

  const permissionInDbMap: Record<string, (typeof permissionsInDb)[0]> = permissionsInDb.reduce((acc, item) => {
    acc[`${item.method}` + '-' + `${item.path}`] = item
    return acc
  }, {})

  const availableRoutesMap: Record<string, (typeof availableRoutes)[0]> = availableRoutes.reduce((acc, item) => {
    acc[`${item.method}` + '-' + `${item.path}`] = item
    return acc
  }, {})

  const permissionsToDelete = permissionsInDb.filter((item) => {
    return !availableRoutesMap[`${item.method}-${item.path}`]
  })

  if (permissionsToDelete.length > 0) {
    const deleteResult = await prisma.permission.deleteMany({
      where: {
        id: {
          in: permissionsToDelete.map((item) => item.id),
        },
      },
    })
    console.log('Deleted permissions:', deleteResult.count)
  } else {
    console.log('No permission to deleted')
  }

  // Tìm routes mà không tồn tại trong permissionsInDb
  const routesToAdd = availableRoutes.filter((item) => {
    return !permissionInDbMap[`${item.method}-${item.path}`]
  })

  if (routesToAdd.length > 0) {
    const permissionsToAdd = await prisma.permission.createMany({
      data: routesToAdd,
      skipDuplicates: true,
    })
    console.log('Added permissions:', permissionsToAdd.count)
  } else {
    console.log('No permission to add')
  }

  const updatedPermissionInDB = await prisma.permission.findMany({
    where: {
      deletedAt: null,
    },
  })

  await prisma.role.update({
    where: {
      name: RoleName.Admin,
    },
    data: {
      permissions: {
        set: updatedPermissionInDB.map((item) => ({
          id: item.id,
        })),
      },
    },
  })
  await app.close()
  process.exit(0)
}
bootstrap()
