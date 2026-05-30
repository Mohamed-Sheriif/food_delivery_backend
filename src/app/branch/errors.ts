import { AppError } from "../../lib/error/AppError";

export class BranchNotFoundError extends AppError {
  constructor() {
    super("Branch not found", 404);
  }
}
