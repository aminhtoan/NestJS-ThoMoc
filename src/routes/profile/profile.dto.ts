import { createZodDto } from 'nestjs-zod'
import { GetProfileDetailResSchema } from './profile.model'

export class GetProfileDetailResDTO extends createZodDto(GetProfileDetailResSchema) {}
