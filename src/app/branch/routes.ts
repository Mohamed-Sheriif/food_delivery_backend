import { Router } from "express";
import { branchController } from "./controller/branch.controller";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";

export const branchRouter = Router();

// create branch
branchRouter.post(
  "/restaurants/:restaurantId/branches",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:branch", action: "create" }),
  branchController.createBranch,
);

// find nearby branches
branchRouter.get("/branches/nearby", branchController.findNearbyBranches);

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
