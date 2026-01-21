import { OrderBy, OrderByType, SortBy } from './../../shared/constants/other.constant'
import z from 'zod'
import { ProductTranslationSchema } from './product-translation/product-translation.model'
import { SKUSchema, UpsertSKUBodySchema } from './sku.model'
import { CategoryIncludeTranslationSchema } from '../category/category.model'
import { GetBrandDetailResSchema } from '../brand/brand.model'

function generateSKUs(variants: VariantsType) {
  // Hàm hỗ trợ để tạo tất cả tổ hợp (Cartesian Product)
  function getCombinations(arrays: string[][]): string[] {
    return arrays.reduce(
      (acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)),
      [''], // Initial value là mảng chứa chuỗi rỗng để bắt đầu nối chuỗi
    )
  }

  // Lấy mảng các options từ variants
  // Ví dụ: [['S', 'M'], ['Red', 'Blue']]
  const options = variants.map((variant) => variant.options)

  // Tạo tất cả tổ hợp
  // Kết quả: ['S-Red', 'S-Blue', 'M-Red', 'M-Blue']
  const combinations = getCombinations(options)

  // Chuyển tổ hợp thành SKU objects
  return combinations.map((value) => ({
    value, // Ví dụ: "S-Red"
    price: 0, // Giá trị mặc định
    stock: 100, // Giá trị mặc định
    image: '',
  }))
}

export const VariantSchema = z.object({
  value: z.string(),
  options: z.array(z.string()),
})

export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
  // 1. Kiểm tra trùng lặp giữa các Variants
  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]

    // Kiểm tra xem có variant nào khác trùng tên (value) không
    const isDifferent = variants.findIndex((v) => v.value.toLowerCase() === variant.value.toLowerCase()) !== i

    if (isDifferent) {
      return ctx.addIssue({
        code: 'custom',
        message: `Giá trị ${variant.value} đã tồn tại trong danh sách variants. Vui lòng kiểm tra lại.`,
        path: ['variants'],
      })
    }

    // 2. Kiểm tra trùng lặp các Options bên trong variant hiện tại
    const isDifferentOption = variant.options.some((opt, index) => {
      return variant.options.findIndex((o) => o.toLowerCase() === opt.toLowerCase()) !== index
    })

    if (isDifferentOption) {
      return ctx.addIssue({
        code: 'custom',
        message: `Variant ${variant.value} chứa các option trùng tên với nhau. Vui lòng kiểm tra lại.`,
        path: ['variants'],
      })
    }
  }
})

export const ProductSchema = z.object({
  id: z.number(),
  publishedAt: z.coerce.date().nullable(), // Tự động ép kiểu sang Date
  name: z.string().max(500),
  basePrice: z.number().min(0),
  virtualPrice: z.number().min(0),
  brandId: z.number().positive(),
  images: z.array(z.string()),
  variants: VariantsSchema, // Json field represented as a record

  // Audit Fields
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// dành cho client và guest
// phục vụ cho chức năng filter, search đó
export const GetProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  name: z.string().optional(),
  brandIds: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value.split(',').map((id) => Number(id))
      } else if (Array.isArray(value)) {
        return value.map((id) => Number(id))
      } else {
        return []
      }
    }, z.array(z.number().int().positive()))
    .optional(),
  categories: z
    .preprocess((value) => {
      if (typeof value === 'string') {
        return value.split(',').map((id) => Number(id))
      } else if (Array.isArray(value)) {
        return value.map((id) => Number(id))
      } else {
        return []
      }
    }, z.array(z.number().int().positive()))
    .optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  createdById: z.coerce.number().int().positive().optional(),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
  sortBy: z.enum([SortBy.Price, SortBy.CreatedAt, SortBy.Sale]).default(SortBy.CreatedAt),
})

// dành cho admin và seller
export const GetManagerProductsQuerySchema = GetProductsQuerySchema.extend({
  isPublic: z.preprocess((value) => value === 'true', z.boolean()).optional(),
  createdById: z.coerce.number().int().positive(),
})

export const GetProductsResSchema = z.object({
  data: z.array(
    ProductSchema.extend({
      productTranslations: z.array(ProductTranslationSchema),
    }),
  ),
  totalItems: z.number(),
  page: z.number(), // Số trang hiện tại
  limit: z.number(), // Số item trên 1 trang
  totalPages: z.number(), // Tổng số trang
})

export const GetProductParamsSchema = z
  .object({
    productId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetProductDetailResSchema = ProductSchema.extend({
  productTranslations: z.array(ProductTranslationSchema),
  skus: z.array(SKUSchema),
  categories: z.array(CategoryIncludeTranslationSchema),
  brand: GetBrandDetailResSchema,
})

export const CreateProductBodySchema = ProductSchema.pick({
  publishedAt: true,
  name: true,
  basePrice: true,
  virtualPrice: true,
  brandId: true,
  images: true,
  variants: true,
})
  .extend({
    categories: z.array(z.coerce.number().int().positive()),
    skus: z.array(UpsertSKUBodySchema),
  })
  .strict()
  .superRefine(({ variants, skus }, ctx) => {
    const skuValueArray = generateSKUs(variants)
    if (skus.length !== skuValueArray.length) {
      return ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `Số lượng SKU nên là ${skuValueArray.length}. Vui lòng kiểm tra lại.`,
      })
    }

    let wrongSKUIndex = -1
    const isValidSKUs = skus.every((sku, index) => {
      const isValid = sku.value === skuValueArray[index].value
      if (!isValid) {
        wrongSKUIndex = index
      }
      return isValid
    })

    if (!isValidSKUs) {
      ctx.addIssue({
        code: 'custom',
        path: ['skus'],
        message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ. Vui lòng kiểm tra lại.`,
      })
    }
  })

export const UpdateProductBodySchema = CreateProductBodySchema
export type ProductType = z.infer<typeof ProductSchema>
export type VariantsType = z.infer<typeof VariantsSchema>
export type GetProductsResType = z.infer<typeof GetProductsResSchema>
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>
export type GetManagerProductsQueryType = z.infer<typeof GetManagerProductsQuerySchema>
