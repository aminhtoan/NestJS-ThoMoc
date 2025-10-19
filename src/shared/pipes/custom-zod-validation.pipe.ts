import { UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'
import { ZodError } from 'zod'

const CustomZodValidationPipe = createZodValidationPipe({
  // provide custom validation exception factory
  createValidationException: (error: ZodError) => {
    console.log(error)
    return new UnprocessableEntityException(
      error.issues.map((item) => {
        return {
          ...item,
          // nối các phần tử trong [] bằng dấu "." vd ["user"] => "user", ['user', 'email'] => "user.email"
          path: item.path.join('.'),
        }
      }),
    )
  },
}) as any

export default CustomZodValidationPipe
