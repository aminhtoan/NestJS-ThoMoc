import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileSizeValidationPipe } from 'src/shared/pipes/file-image-validation.pipe'
import { MediaService } from './media.service'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('images/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(new FileSizeValidationPipe())
    file: Express.Multer.File,
  ) {
    return file
  }
}
