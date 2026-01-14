import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
const sharp = require('sharp')

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File) {
    try {
      await sharp(value.path).metadata()
    } catch {
      throw new BadRequestException('File không phải ảnh hợp lệ')
    }
    const oneMb = 3 * 1024 * 1024

    if (value.size > oneMb) {
      throw new BadRequestException('File vượt quá kích thước cho phép 1MB')
    }

    return value
  }
}
