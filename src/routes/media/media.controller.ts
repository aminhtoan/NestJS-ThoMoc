import {
  BadRequestException,
  Body,
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
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import envConfig from 'src/shared/config'
import { UPLOAD_DIR } from 'src/shared/constants/other.constant'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { FileSizeValidationPipe } from 'src/shared/pipes/file-image-validation.pipe'
import { CloudinaryService } from 'src/shared/services/cloudinary.service'
import { MediaService } from './media.service'

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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
  @UseInterceptors(FilesInterceptor('files', 10))
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

  @Post('image/cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageToCloudinary(
    @UploadedFile(new FileSizeValidationPipe()) file: Express.Multer.File,
    @Body('folder') folder: string,
  ) {
    try {
      const result = await this.cloudinaryService.uploadImage(file.path, folder)
      return { url: result.secure_url }
    } catch (error) {
      console.log('Error uploading', error)
      throw new Error('Failed to upload image')
    }
  }

  @Post('images/cloudinary')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadImagesToCloudinary(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)/, skipMagicNumbersValidation: true }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body('folder') folder: string,
  ) {
    try {
      const result = await this.cloudinaryService.uploadImages(files, folder)

      return result.map((file) => ({
        url: file.secure_url,
      }))
    } catch (error) {
      console.log('Error uploading', error)
      throw new Error('Failed to upload image')
    }
  }

  // lấy default_avatar trong  /public/images
  @Get('default-avatar')
  @IsPublic()
  async getDefaultAvatar(@Res() res: Response) {
    const filePath = path.resolve('public/images/default-avatar.png')
    res.sendFile(filePath)
    
    return filePath
  }
}
