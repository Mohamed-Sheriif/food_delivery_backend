import { AppError } from "../../common/error/AppError";

export class UserAlreadyExistsError extends AppError {
  constructor() {
    super("User Already Exists with same phone or email", 400);
  }
}

export class CannotSignupAsSystemAdminError extends AppError {
  constructor() {
    super("You cannot register as a system admin", 403);
  }
}

export class IncorrectCredentialsError extends AppError {
  constructor() {
    super("Incorrect email or password", 401);
  }
}

export class InvalidOTPError extends AppError {
  constructor() {
    super("Invalid OTP", 401);
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super("Invalid token", 401);
  }
}

export class RestaurantDataRequiredError extends AppError {
  constructor() {
    super("Restaurant data is required", 400);
  }
}
