import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";
import { BranchController } from "./controller/branch.controller";
import { withCache } from "../../lib/cache/with-cache";

export const branchRouter = Router();

const branchController = container.resolve<BranchController>(
  TOKENS.BranchController,
);

// create branch
branchRouter.post(
  "/restaurants/:restaurantId/branches",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:branch", action: "create" }),
  branchController.createBranch,
);

// find nearby branches
branchRouter.get(
  "/branches/nearby",
  withCache(),
  branchController.findNearbyBranches,
);

// update branch
branchRouter.patch(
  "/branches/:id",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:branch", action: "update" }),
  branchController.updateBranch,
);

// update branch status
branchRouter.patch(
  "/branches/:id/status",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:branch", action: "update" }),
  branchController.updateBranchStatus,
);
