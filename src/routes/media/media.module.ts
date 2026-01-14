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
    // //
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    // const ext = extname(file.originalname) // .png, .jpg

    // cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  },
})

@Module({
  imports: [
    MulterModule.register({
      storage,
    }),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
