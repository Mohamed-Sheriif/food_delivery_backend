import { AppError } from "../../lib/error/AppError";

export class UserNotFoundError extends AppError {
  constructor() {
    super("User not found", 404);
  }
}
