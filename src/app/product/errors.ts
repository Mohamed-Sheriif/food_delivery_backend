import { AppError } from "../../common/error/AppError";

export const ProductCategoryAlreadyExistsError = new AppError(
  "Product category with the same name already exists",
  400,
);

export const ProductNotFoundError = new AppError("Product not found", 404);

export const ProductBranchDetailsNotFoundError = new AppError(
  "Product branch details not found",
  404,
);

export const BranchIdRequiredForBranchFieldsError = new AppError(
  "branchId is required when updating price, stock, or availability",
  400,
);

export const BranchNotBelongToProductRestaurantError = new AppError(
  "Branch does not belong to the product's restaurant",
  400,
);