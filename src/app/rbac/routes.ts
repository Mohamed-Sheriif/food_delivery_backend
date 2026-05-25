import { Router } from "express";
import { memberController } from "./controller/member.controller";
import { authenticate } from "../../common/auth/guard";
import { rbac, requireRestaurantMember } from "../../common/auth/rbac";

export const rbacRouter = Router();

rbacRouter.post(
  "/restaurants/:restaurantId/members",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "create" }),
  memberController.createMember,
);
