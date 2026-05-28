import { AppError } from "../../common/error/AppError";

export class BranchNotFoundError extends AppError {
  constructor() {
    super("Branch not found", 404);
  }
}
