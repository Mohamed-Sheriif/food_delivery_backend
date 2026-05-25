import { AppError } from "../../common/error/AppError";

export class RestaurantNotFoundError extends AppError {
  constructor() {
    super("Restaurant not found", 404);
  }
}
