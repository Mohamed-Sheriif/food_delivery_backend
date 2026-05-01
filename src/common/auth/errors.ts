import { AppError } from "../error/AppError";

export const UserNotAuthenticatedError = new AppError(
  "User not authenticated",
  401,
);
