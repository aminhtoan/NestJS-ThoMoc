import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
const sharp = require('sharp')

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File) {
    // 1. Kiểm tra xem file có tồn tại không
    if (!value) {
      throw new BadRequestException('File is required')
    }

    // 2. Kiểm tra kích thước trước (nhẹ hơn, đỡ tốn resource check metadata)
    const oneMb = 5 * 1024 * 1024
    if (value.size > oneMb) {
      throw new BadRequestException('File size exceeds limit (5MB)')
    }

    // 3. Kiểm tra định dạng ảnh bằng Sharp
    try {
      await sharp(value.path).metadata()
    } catch (error) {
      // console.error(error);
      throw new BadRequestException('Invalid image file format')
    }

    return value
  }
}
