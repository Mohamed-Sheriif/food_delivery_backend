import { AppError } from "../error/AppError";

export class RequestValidationError extends AppError {
  constructor(messages: string[]) {
    super(messages.join(", '\n'"), 400);
  }
}
