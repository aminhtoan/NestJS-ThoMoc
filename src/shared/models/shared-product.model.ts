import z from 'zod'

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
