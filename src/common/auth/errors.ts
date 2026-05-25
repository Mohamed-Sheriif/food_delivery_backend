import { AppError } from "../error/AppError";

export class UserNotAuthenticatedError extends AppError {
  constructor() {
    super("User not authenticated", 401);
  }
}

export class OnlySystemAdminAllowedError extends AppError {
  constructor() {
    super("Unauthorized error: Only system admin allowed to do this action", 403);
  }
}

export class OnlySystemAdminOrRestaurantOwnerAllowedError extends AppError {
  constructor() {
    super(
      "Unauthorized error: Only system admin or restaurant owner allowed to do this action",
      403,
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super("Unauthorized error: You do not have permission to do this action", 403);
  }
}

export class SomethingWentWrongError extends AppError {
  constructor() {
    super("Something went wrong", 500);
  }
}
