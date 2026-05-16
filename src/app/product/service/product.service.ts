import { UnauthorizedErrorOnlySystemAdminOrRestaurantOwner } from "../../../common/auth/errors";
import { RestaurantNotFoundError } from "../../restaurant/errors";
import { RestaurantService, restaurantService } from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import { CreateProductCategoryDTO } from "../dto/product-category.dto";
import { ProductCategory } from "../entity/product-category.entity";
import { ProductCategoryAlreadyExistsError } from "../errors";
import { createProductCategory, findAllProductCategoriesByRestaurantId, findProductCategoryByRestaurantIdAndName } from "../repository/product-category.repo";


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

  findAllProductCategoriesByRestaurantId = async (
    restaurantId: number,
  ): Promise<ProductCategory[]> => {
    // 1. get product categories by restaurant id
    const productCategories = await findAllProductCategoriesByRestaurantId(restaurantId);

    // 2. return product categories
    return productCategories;
  };
}

export const productService = new ProductService(restaurantService);