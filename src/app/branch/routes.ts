import { Router } from "express";
import { branchController } from "./controller/branch.controller";
import { authenticate } from "../../common/auth/guard";

export const branchRouter = Router();

branchRouter.post(
  "/restaurants/:restaurantId/branches",
  authenticate,
  branchController.createBranch,
);
branchRouter.get("/branches/nearby", branchController.findNearbyBranches);
