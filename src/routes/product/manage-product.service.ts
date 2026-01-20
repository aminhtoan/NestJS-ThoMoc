import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ProductRepository } from './product.repo'
import { CreateProductBodyType, GetManagerProductsQueryType, GetProductsQueryType } from './product.model'
import { I18n, I18nContext } from 'nestjs-i18n'
import { isRecordNotFoundError } from 'src/shared/helpers'
import { RoleName } from 'src/shared/constants/role.constant'

@Injectable()
export class ManageProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  validatePrivilege({
    userIdRequest,
    roleNameRequest,
    createdById,
  }: {
    userIdRequest: number
    roleNameRequest: string
    createdById: number | undefined | null
  }) {
    if (userIdRequest !== createdById && roleNameRequest !== RoleName.Admin) {
      throw new ForbiddenException()
    }
    return true
  }

  async getProducts(props: { query: GetManagerProductsQueryType; userIdRequest: number; roleNameRequest: string }) {
    this.validatePrivilege({
      userIdRequest: props.userIdRequest,
      roleNameRequest: props.roleNameRequest,
      createdById: props.query.createdById,
    })
    return await this.productRepository.list({
      page: props.query.page,
      limit: props.query.limit,
      name: props.query.name,
      languageId: I18nContext.current()?.lang as string,
    })
  }

  async getDetail(props: { productId: number; userIdRequest: number; roleNameRequest: string }) {
    const product = await this.productRepository.getDetail({
      productId: props.productId,
      languageId: I18nContext.current()?.lang as string,
    })

    if (!product) {
      throw new NotFoundException([
        {
          message: 'Product bạn tìm không tồn tại',
        },
      ])
    }

    this.validatePrivilege({
      userIdRequest: props.userIdRequest,
      roleNameRequest: props.roleNameRequest,
      createdById: product.createdById,
    })

    return product
  }

  async create(data: CreateProductBodyType, userId: number) {
    return await this.productRepository.create(data, userId)
  }

  async update(data: CreateProductBodyType, userId: number, productId: number, roleNameRequest: string) {
    try {
      const product = await this.productRepository.findById({ productId })

      this.validatePrivilege({
        userIdRequest: userId,
        roleNameRequest,
        createdById: product.createdById,
      })

      return await this.productRepository.update(data, userId, productId)
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Product bạn muốn cập nhật không tồn tại',
          },
        ])
      }
      throw error
    }
  }

  async delete(productId: number, deletedById: number, roleNameRequest: string) {
    try {
      const product = await this.productRepository.findById({ productId })

      this.validatePrivilege({
        userIdRequest: deletedById,
        roleNameRequest,
        createdById: product.createdById,
      })
      await this.productRepository.delete(productId, deletedById)
      return {
        message: 'Xóa sản phẩm thành công',
      }
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new NotFoundException([
          {
            message: 'Product bạn muốn xóa không tồn tại',
          },
        ])
      }
      throw error
    }
  }
}
