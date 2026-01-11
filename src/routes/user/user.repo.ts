import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class UserRepository {
  constructor(private readonly prismaService: PrismaService) {}
}
