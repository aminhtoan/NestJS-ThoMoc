import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashinngService } from 'src/shared/services/hashinng.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prisma = new PrismaService()
const hashinngService = new HashinngService()
const main = async () => {
  const rolecount = await prisma.role.count()

  // Nếu file này đã chạy thì nó sẽ báo ra if dưới
  if (rolecount > 0) {
    throw new Error('Roles already exists')
  }

  // tạo dữ liệu role admin,client,.....
  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: 'Admin role',
      },
      {
        name: RoleName.Seller,
        description: 'Seller role',
      },
      {
        name: RoleName.Client,
        description: 'Client role',
      },
    ],
    skipDuplicates: true,
  })

  // kiểm tra dữ liệu trên đã có chưa
  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
    },
  })

  // tạo email password
  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      name: envConfig.ADMIN_NAME,
      password: hashinngService.hash(envConfig.ADMIN_PASSWORD),
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })

  return {
    createRoleCount: roles.count,
    adminUser,
  }
}

main()
  .then(({ adminUser, createRoleCount }) => {
    console.log(`Created ${createRoleCount} roles`)
    console.log(`Created admin user ${adminUser.email}`)
  })
  .catch(console.error)
