import { AppError } from "../../common/error/AppError";

export class CustomerAddressNotFoundError extends AppError {
  constructor() {
    super("Customer address not found", 404);
  }
}

export class CustomerAddressForbiddenError extends AppError {
  constructor() {
    super("You are not allowed to access this customer address", 403);
  }
}
