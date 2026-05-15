import { AppError } from "../error/AppError";

export const UserNotAuthenticatedError = new AppError(
  "User not authenticated",
  401,
);

export const UnauthorizedErrorOnlySystemAdmin = new AppError(
  "Unauthorized error: Only system admin allowed to do this action",
  403,
);

export const UnauthorizedErrorOnlySystemAdminOrRestaurantOwner = new AppError(
  "Unauthorized error: Only system admin or restaurant owner allowed to do this action",
  403,
);
