import { UnauthorizedErrorOnlySystemAdminOrRestaurantOwner } from "../../../common/auth/errors";
import { BranchNotFoundError } from "../../branch/errors";
import { findBranchById } from "../../branch/repository/branch.repo";
import { RestaurantNotFoundError } from "../../restaurant/errors";
import { RestaurantService, restaurantService } from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import { CreateProductCategoryDTO } from "../dto/product-category.dto";
import { BranchProduct } from "../entity/branch-product.entity";
import { Product } from "../entity/product.entity";
import { ProductCategory } from "../entity/product-category.entity";
import { ProductCategoryAlreadyExistsError, ProductNotFoundError } from "../errors";
import { createProductCategory, findAllProductCategoriesByRestaurantId, findProductCategoryByRestaurantIdAndName } from "../repository/product-category.repo";
import { createProduct, findProductById, findProductsByBranch, findProductsByRestaurant } from "../repository/product.repo";
import { CreateProductDTO } from "../dto/product.dto";
import { db } from "../../../common/knex/knex";


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
      throw RestaurantNotFoundError;
    }

    // 3. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant?.ownerId)
    ) {
      throw UnauthorizedErrorOnlySystemAdminOrRestaurantOwner;
    }

    // 4. check if product category already exists (case-insensitive)
    const name = data.name;
    const normalizedName = name.toLowerCase();
    const existingCategory = await findProductCategoryByRestaurantIdAndName(
      restaurantId,
      normalizedName,
    );
    if (existingCategory) {
      throw ProductCategoryAlreadyExistsError;
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
      throw RestaurantNotFoundError;
    }

    // 3. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant.ownerId)
    ) {
      throw UnauthorizedErrorOnlySystemAdminOrRestaurantOwner;
    }

    // 4. check if product category exists (case-insensitive), if not create it
    const now = new Date();
    const categoryName = data.categoryName;
    const normalizedCategoryName = categoryName.toLowerCase();
    const trx = await db.transaction();
    let category = await findProductCategoryByRestaurantIdAndName(restaurantId, normalizedCategoryName);
    try {
      if (!category) {
        category = await createProductCategory({
          name: categoryName,
          restaurantId,
          createdAt: now,
          updatedAt: now,
        }, trx);
      }

      // 5. create product
      const newProduct = await createProduct({
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        restaurantId,
        categoryId: category.id,
        createdAt: now,
        updatedAt: now,
      }, trx);

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
    const productCategories = await findAllProductCategoriesByRestaurantId(restaurantId);

    // 2. return product categories
    return productCategories;
  };

  findByBranch = async (branchId: number): Promise<BranchProduct[]> => {
    // 1. get branch by id
    const branch = await findBranchById(branchId);

    // 2. throw error if branch not found
    if (!branch) {
      throw BranchNotFoundError;
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
      throw RestaurantNotFoundError;
    }

    // 3. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant.ownerId)
    ) {
      throw UnauthorizedErrorOnlySystemAdminOrRestaurantOwner;
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
      throw ProductNotFoundError;
    }

    // 3. return product
    return product;
  };
}

export const productService = new ProductService(restaurantService);