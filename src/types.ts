import { VariantsType } from './routes/product/product.model'

declare global {
  namespace PrismsJson {
    type Variants = VariantsType
  }
}
