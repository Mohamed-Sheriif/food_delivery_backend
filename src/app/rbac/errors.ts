import { AppError } from "../../common/error/AppError";

export class CannotCreateOwnerMemberError extends AppError {
  constructor() {
    super("Not allowed to create another owner", 400);
  }
}

export class RoleNotFoundError extends AppError {
  constructor() {
    super("Role not found", 404);
  }
}

export class BranchesNotFoundError extends AppError {
  constructor(branchIds: number[]) {
    super(`Branch(s) ${branchIds.join(", ")} not found`, 404);
  }
}

export class BranchesDoNotBelongToRestaurantError extends AppError {
  constructor(branchIds: number[]) {
    super(
      `Branch(s) ${branchIds.join(", ")} does not belong to the restaurant`,
      400,
    );
  }
}
