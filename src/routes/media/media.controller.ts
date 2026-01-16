import {
  BadRequestException,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { FileSizeValidationPipe } from 'src/shared/pipes/file-image-validation.pipe'
import { MediaService } from './media.service'
import envConfig from 'src/shared/config'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import path from 'path'
import { Response } from 'express'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { promises as fs } from 'fs'

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('image/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(new FileSizeValidationPipe())
    file: Express.Multer.File,
  ) {
    return {
      url: `${envConfig.PREFIX_STATIC_ENPOINT}/${file.filename}`,
    }
  }

  @Post('images/upload')
  @UseInterceptors(FilesInterceptor('files', 2))
  uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)/, skipMagicNumbersValidation: true }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    return files.map((file) => ({
      url: `${envConfig.PREFIX_STATIC_ENPOINT}/${file.filename}`,
    }))
  }

  @Get('static/:file')
  @IsPublic()
  async serveStaticFile(@Param('file') file: string, @Res() res: Response) {
    const safeFileName = path.basename(file)
    if (safeFileName !== file) {
      throw new BadRequestException('Invalid file name')
    }

    const filePath = path.resolve(UPLOAD_DIR, safeFileName)

    try {
      // Kiểm tra file tồn tại trước (tùy chọn nhưng tốt hơn)
      await fs.access(filePath, fs.constants.R_OK)
      res.sendFile(filePath)
    } catch (err) {
      throw new NotFoundException('File not found')
    }
  }
}
