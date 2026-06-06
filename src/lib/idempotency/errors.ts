import { AppError } from "../error/AppError";

export class IdempotencyKeyRequiredError extends AppError {
  constructor() {
    super("Idempotency-Key header is required", 400);
  }
}

export class IdempotencyServiceUnavailableError extends AppError {
  constructor() {
    super("Idempotency service unavailable", 503);
  }
}
