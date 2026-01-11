import { Injectable } from '@nestjs/common'
import { UserRepository } from './user.repo'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
}
