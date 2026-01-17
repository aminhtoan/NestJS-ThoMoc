import { BadRequestException, Injectable } from '@nestjs/common'
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary'
import envConfig from 'src/shared/config'
import { promises as fs } from 'fs'

@Injectable()
export class CloudinaryService {
  constructor() {
    v2.config({
      cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
      api_key: envConfig.CLOUDINARY_API_KEY,
      api_secret: envConfig.CLOUDINARY_API_SECRET,
    })
  }

  async uploadImage(filePath: string, folder: string = 'others'): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      v2.uploader.upload(filePath, { folder }, (error, result) => {
        if (error) return reject(error)

        const response = result as UploadApiResponse

        fs.unlink(filePath).catch((err) => console.error('Error cleaning up file:', err))

        resolve(response)
      })
    })
  }

  async uploadImages(files: Array<Express.Multer.File>, folder: string = 'others') {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded')
    }

    try {
      const uploadPromises = files.map((file) => this.uploadImage(file.path, folder))
      const results = await Promise.all(uploadPromises)
      return results
    } catch (error) {
      throw new BadRequestException(`Upload failed: ${(error as UploadApiErrorResponse).message || 'Unknown error'}`)
    }
  }
}
