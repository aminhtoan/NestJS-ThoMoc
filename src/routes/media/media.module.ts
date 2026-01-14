import { Module } from '@nestjs/common'
import { MediaService } from './media.service'
import { MediaController } from './media.controller'
import { MulterModule } from '@nestjs/platform-express'

import multer from 'multer'
import path, { extname } from 'path'
import { generateRandomFileName } from 'src/shared/helpers'
const UPLOAD_DIR = path.resolve('upload')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR)
  },
  filename: function (req, file, cb) {
    const name = generateRandomFileName(file.originalname)
    cb(null, name)
  },
})

const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(null, false)
  }

  cb(null, true)
}

@Module({
  imports: [
    MulterModule.register({
      storage,
      fileFilter,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
