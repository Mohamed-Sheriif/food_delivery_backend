import { AppError } from "../../common/error/AppError";

export class ProductCategoryAlreadyExistsError extends AppError {
  constructor() {
    super("Product category with the same name already exists", 400);
  }
}

export class ProductNotFoundError extends AppError {
  constructor() {
    super("Product not found", 404);
  }
}

export class ProductBranchDetailsNotFoundError extends AppError {
  constructor() {
    super("Product branch details not found", 404);
  }
}

export class BranchIdRequiredForBranchFieldsError extends AppError {
  constructor() {
    super("branchId is required when updating price, stock, or availability", 400);
  }
}

export class BranchDoesNotBelongToProductRestaurantError extends AppError {
  constructor() {
    super("Branch does not belong to the product's restaurant", 400);
  }
}