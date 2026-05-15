import { Router } from "express";
import { branchController } from "./controller/branch.controller";
import { authenticate } from "../../common/auth/guard";

export const branchRouter = Router();

// create branch
branchRouter.post(
  "/restaurants/:restaurantId/branches",
  authenticate,
  branchController.createBranch,
);

// find nearby branches
branchRouter.get("/branches/nearby", branchController.findNearbyBranches);

// update branch
branchRouter.patch(
  "/branches/:id",
  authenticate,
  branchController.updateBranch,
);

// update branch status
branchRouter.patch(
  "/branches/:id/status",
  authenticate,
  branchController.updateBranchStatus,
);
