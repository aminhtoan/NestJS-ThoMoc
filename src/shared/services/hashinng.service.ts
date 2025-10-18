import { Injectable } from '@nestjs/common'
import bcrypt from 'bcrypt'
const saltRounds = 10

@Injectable()
export class HashinngService {
  // hashPassword  (password: string): string {
  //     const salt = bcrypt.genSaltSync(saltRounds);
  //     const hash = bcrypt.hashSync(password, salt);

  //     return hash
  // }

  hash(valueL: string) {
    return bcrypt.hashSync(valueL, saltRounds)
  }

  compare(valueL: string, hash: string) {
    return bcrypt.compare(valueL, hash)
  }
}
