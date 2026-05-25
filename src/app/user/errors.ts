import { AppError } from "../../common/error/AppError";

export class UserNotFoundError extends AppError {
  constructor() {
    super("User not found", 404);
  }
}
