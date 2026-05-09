import { AppError } from "../../common/error/AppError";

export const RestaurantNotFoundError = new AppError(
  "Restaurant not found",
  404,
);

export const UnauthorizedErrorOnlySystemAdmin = new AppError(
  "Unauthorized error: Only system admin can create a restaurant",
  403,
);

export const UnauthorizedErrorOnlySystemAdminOrRestaurantOwner = new AppError(
  "Unauthorized error: Only system admin or restaurant owner can update restaurant status",
  403,
);
