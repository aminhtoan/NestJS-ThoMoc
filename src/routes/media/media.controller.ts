import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { MediaService } from './media.service'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    console.log(file)
  }
}
