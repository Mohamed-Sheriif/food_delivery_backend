import { AppError } from "../../common/error/AppError";

export const ProductCategoryAlreadyExistsError = new AppError(
  "Product category with the same name already exists",
  400,
);

export const ProductNotFoundError = new AppError("Product not found", 404);