import { AppError } from "../../common/error/AppError";

export const CustomerAddressNotFoundError = new AppError(
  "Customer address not found",
  404,
);

export const CustomerAddressForbiddenError = new AppError(
  "You are not allowed to access this customer address",
  403,
);
