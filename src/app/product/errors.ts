import { AppError } from "../../common/error/AppError";

export const ProductCategoryAlreadyExistsError = new AppError(
  "Product category with the same name already exists",
  400,
);