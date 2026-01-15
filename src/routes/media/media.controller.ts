import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseArrayPipe,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common'
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { FileSizeValidationPipe } from 'src/shared/pipes/file-image-validation.pipe'
import { MediaService } from './media.service'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('image/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(new FileSizeValidationPipe())
    file: Express.Multer.File,
  ) {
    return file
  }

  @Post('images/upload')
  @UseInterceptors(FilesInterceptor('files', 1))
  uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return files
  }
}
