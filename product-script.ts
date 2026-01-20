type Variant = {
  value: string
  options: string[]
}
type SKU = {
  value: string
  price: number
  stock: number
  image: string
}
const variants: Variant[] = [
  {
    value: 'Size',
    options: ['S', 'M', 'L'],
  },
  {
    value: 'Color',
    options: ['Đen', 'Trắng', 'Xám'],
  },
]

type Data = {
  product: {
    publishedAt: string | null // ISO date string
    name: string
    basePrice: number
    virtualPrice: number
    brandId: number
    images: string[]
    variants: Variant[]
    categories: number[]
  }
  skus: SKU[]
}

const data: Data = {
  product: {
    publishedAt: null,
    name: 'Áo thun cotton cao cấp',
    basePrice: 200000,
    virtualPrice: 250000,
    brandId: 1,
    images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
    variants: [
      {
        value: 'Kích thước',
        options: ['S', 'M', 'L', 'XL'],
      },
      {
        value: 'Màu sắc',
        options: ['Tím', 'Đen', 'Trắng', 'Xanh'],
      },
      {
        value: 'Chất liệu',
        options: ['Cotton', 'Polyester', 'Linen'],
      },
    ],
    categories: [1, 2, 3],
  },
  skus: [
    {
      value: 'S-Tím-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Tím-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Tím-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Đen-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Đen-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Đen-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Trắng-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Trắng-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Trắng-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Xanh-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Xanh-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'S-Xanh-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Tím-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Tím-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Tím-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Đen-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Đen-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Đen-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Trắng-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Trắng-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Trắng-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Xanh-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Xanh-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'M-Xanh-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Tím-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Tím-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Tím-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Đen-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Đen-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Đen-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Trắng-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Trắng-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Trắng-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Xanh-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Xanh-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'L-Xanh-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Tím-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Tím-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Tím-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Đen-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Đen-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Đen-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Trắng-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Trắng-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Trắng-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Xanh-Cotton',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Xanh-Polyester',
      price: 0,
      stock: 100,
      image: '',
    },
    {
      value: 'XL-Xanh-Linen',
      price: 0,
      stock: 100,
      image: '',
    },
  ],
}
function generateSKUs(variants: Variant[]): SKU[] {
  if (variants.length === 0) {
    return [{ value: '', price: 0, stock: 100, image: '' }]
  }

  return variants.reduce<SKU[]>((acc, variant, index) => {
    if (index === 0) {
      // Nhóm đầu tiên
      return variant.options.map((opt) => ({
        value: opt,
        price: 0,
        stock: 100,
        image: '',
      }))
    }

    // Kết hợp với các variant trước đó
    return acc.flatMap((prev) =>
      variant.options.map((opt) => ({
        ...prev,
        value: `${prev.value}-${opt}`,
      })),
    )
  }, [])
}

const skus = generateSKUs(variants)
console.log(JSON.stringify(skus))
