import { OnlySystemAdminOrRestaurantOwnerAllowedError } from "../../../lib/auth/errors";
import { BranchNotFoundError } from "../../branch/errors";
import { findBranchById } from "../../branch/repository/branch.repo";
import { RestaurantNotFoundError } from "../../restaurant/errors";
import {
  RestaurantService,
  restaurantService,
} from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import { CreateProductCategoryDTO } from "../dto/product-category.dto";
import { BranchProduct } from "../entity/branch-product.entity";
import { Product } from "../entity/product.entity";
import { ProductCategory } from "../entity/product-category.entity";
import {
  BranchIdRequiredForBranchFieldsError,
  BranchDoesNotBelongToProductRestaurantError,
  ProductBranchDetailsNotFoundError,
  ProductCategoryAlreadyExistsError,
  ProductNotFoundError,
} from "../errors";
import {
  createProductCategory,
  findAllProductCategoriesByRestaurantId,
  findProductCategoryByRestaurantIdAndName,
} from "../repository/product-category.repo";
import {
  findProductBranchDetailsByProductAndBranch,
  updateBranchDetails,
} from "../repository/product-branch-details.repo";
import {
  createProduct,
  findProductById,
  findProductsByBranch,
  findProductsByRestaurant,
  updateProduct,
} from "../repository/product.repo";
import { CreateProductDTO, UpdateProductDTO } from "../dto/product.dto";
import { db } from "../../../lib/knex/knex";
import { ProductBranchDetails } from "../entity/product-branch-details.entity";

export class ProductService {
  constructor(private readonly restaurantService: RestaurantService) {}

  createProductCategory = async (
    authenticatedUser: {
      userId: number;
      role: string;
    },
    restaurantId: number,
    data: CreateProductCategoryDTO,
  ): Promise<ProductCategory> => {
    // 1. get restaurant by id
    const restaurant = await this.restaurantService.findById(restaurantId);

    // 2. throw error if restaurant not found
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 3. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant?.ownerId)
    ) {
      throw new OnlySystemAdminOrRestaurantOwnerAllowedError();
    }

    // 4. check if product category already exists (case-insensitive)
    const name = data.name;
    const normalizedName = name.toLowerCase();
    const existingCategory = await findProductCategoryByRestaurantIdAndName(
      restaurantId,
      normalizedName,
    );
    if (existingCategory) {
      throw new ProductCategoryAlreadyExistsError();
    }

    // 5. create product category
    const now = new Date();
    const newProductCategory = await createProductCategory({
      name,
      restaurantId,
      createdAt: now,
      updatedAt: now,
    });

    // 6. return product category
    return newProductCategory;
  };

  createProduct = async (
    authenticatedUser: {
      userId: number;
      role: string;
    },
    restaurantId: number,
    data: CreateProductDTO,
  ): Promise<Product> => {
    // 1. get restaurant by id
    const restaurant = await this.restaurantService.findById(restaurantId);

    // 2. throw error if restaurant not found
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 3. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant.ownerId)
    ) {
      throw new OnlySystemAdminOrRestaurantOwnerAllowedError();
    }

    // 4. check if product category exists (case-insensitive), if not create it
    const now = new Date();
    const categoryName = data.categoryName;
    const normalizedCategoryName = categoryName.toLowerCase();
    const trx = await db.transaction();
    let category = await findProductCategoryByRestaurantIdAndName(
      restaurantId,
      normalizedCategoryName,
    );
    try {
      if (!category) {
        category = await createProductCategory(
          {
            name: categoryName,
            restaurantId,
            createdAt: now,
            updatedAt: now,
          },
          trx,
        );
      }

      // 5. create product
      const newProduct = await createProduct(
        {
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          restaurantId,
          categoryId: category.id,
          createdAt: now,
          updatedAt: now,
        },
        trx,
      );

      // 6. commit transaction
      await trx.commit();

      // 7. return product
      return newProduct;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  };

  findAllProductCategoriesByRestaurantId = async (
    restaurantId: number,
  ): Promise<ProductCategory[]> => {
    // 1. get product categories by restaurant id
    const productCategories =
      await findAllProductCategoriesByRestaurantId(restaurantId);

    // 2. return product categories
    return productCategories;
  };

  findByBranch = async (branchId: number): Promise<BranchProduct[]> => {
    // 1. get branch by id
    const branch = await findBranchById(branchId);

    // 2. throw error if branch not found
    if (!branch) {
      throw new BranchNotFoundError();
    }

    // 3. get products by branch id
    const products = await findProductsByBranch(branchId);

    // 4. return products
    return products;
  };

  findByRestaurant = async (
    authenticatedUser: {
      userId: number;
      role: string;
    },
    restaurantId: number,
  ): Promise<Product[]> => {
    // 1. get restaurant by id
    const restaurant = await this.restaurantService.findById(restaurantId);

    // 2. throw error if restaurant not found
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 3. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant.ownerId)
    ) {
      throw new OnlySystemAdminOrRestaurantOwnerAllowedError();
    }

    // 4. get products by restaurant id
    const products = await findProductsByRestaurant(restaurantId);

    // 5. return products
    return products;
  };

  findById = async (id: number): Promise<Product> => {
    // 1. get product by id
    const product = await findProductById(id);

    // 2. throw error if product not found
    if (!product) {
      throw new ProductNotFoundError();
    }

    // 3. return product
    return product;
  };

  update = async (
    authenticatedUser: {
      userId: number;
      role: string;
    },
    productId: number,
    data: UpdateProductDTO,
    branchId?: number,
  ): Promise<{ product: Product; branchDetails?: ProductBranchDetails }> => {
    // 1. get product by id
    const product = await findProductById(productId);
    if (!product) {
      throw new ProductNotFoundError();
    }

    // 2. get restaurant by id
    const restaurant = await this.restaurantService.findById(
      product.restaurantId,
    );
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 3. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant.ownerId)
    ) {
      throw new OnlySystemAdminOrRestaurantOwnerAllowedError();
    }

    // 4. check if branch id is provided if there are branch fields
    const hasBranchFields =
      data.price !== undefined ||
      data.stock !== undefined ||
      data.isAvailable !== undefined;
    if (hasBranchFields && branchId === undefined) {
      throw new BranchIdRequiredForBranchFieldsError();
    }

    // 5. check if should update branch details
    const shouldUpdateBranchDetails = branchId !== undefined && hasBranchFields;

    if (shouldUpdateBranchDetails) {
      // 6. get branch by id
      const branch = await findBranchById(branchId);
      if (!branch) {
        throw new BranchNotFoundError();
      }

      // 7. check if branch belongs to the product's restaurant
      if (branch.restaurantId !== product.restaurantId) {
        throw new BranchDoesNotBelongToProductRestaurantError();
      }

      // 8. check if product branch details exists
      const existingDetails = await findProductBranchDetailsByProductAndBranch(
        productId,
        branchId,
      );
      if (!existingDetails) {
        throw new ProductBranchDetailsNotFoundError();
      }
    }

    const productUpdate: Partial<Product> = {};
    if (data.name !== undefined) productUpdate.name = data.name;
    if (data.description !== undefined)
      productUpdate.description = data.description;
    if (data.imageUrl !== undefined) productUpdate.imageUrl = data.imageUrl;

    // 9. check if there are product fields
    const hasProductFields =
      data.name !== undefined ||
      data.description !== undefined ||
      data.imageUrl !== undefined ||
      data.categoryName !== undefined;

    // 10. check if needs transaction
    const needsTransaction = hasProductFields && shouldUpdateBranchDetails;
    const trx = needsTransaction ? await db.transaction() : undefined;

    try {
      const conn = trx ?? db;

      // 11. check if category name is provided
      if (data.categoryName !== undefined) {
        const categoryName = data.categoryName;
        const normalizedCategoryName = categoryName.toLowerCase();

        // 12. check if category exists
        let category = await findProductCategoryByRestaurantIdAndName(
          product.restaurantId,
          normalizedCategoryName,
        );

        // 13. if category does not exist, create it
        if (!category) {
          const now = new Date();
          category = await createProductCategory(
            {
              name: categoryName,
              restaurantId: product.restaurantId,
              createdAt: now,
              updatedAt: now,
            },
            conn,
          );
        }
        productUpdate.categoryId = category.id;
      }

      // 14. update product
      let updatedProduct = product;
      if (hasProductFields) {
        const result = await updateProduct(productId, productUpdate, conn);
        updatedProduct = result ?? updatedProduct;
      }

      // 15. update branch details if exists
      let branchDetails: ProductBranchDetails | undefined;
      if (shouldUpdateBranchDetails) {
        const result = await updateBranchDetails(
          productId,
          branchId!,
          {
            price: data.price,
            stock: data.stock,
            isAvailable: data.isAvailable,
          },
          conn,
        );
        branchDetails = result;
      }

      // 16. commit transaction if exists
      if (trx) {
        await trx.commit();
      }

      // 17. return product and branch details if exists
      return branchDetails
        ? { product: updatedProduct, branchDetails }
        : { product: updatedProduct };
    } catch (error) {
      // 18. rollback transaction if exists
      if (trx) {
        await trx.rollback();
      }
      throw error;
    }
  };
}

export const productService = new ProductService(restaurantService);
