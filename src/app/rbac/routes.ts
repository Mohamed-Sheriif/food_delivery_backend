import { Router } from "express";
import { memberController } from "./controller/member.controller";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";

export const rbacRouter = Router();

rbacRouter.post(
  "/restaurants/:restaurantId/members",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "create" }),
  memberController.createMember,
);

rbacRouter.get(
  "/restaurants/:restaurantId/members",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "read" }),
  memberController.listMembers,
);

rbacRouter.patch(
  "/restaurants/:restaurantId/members/:memberId",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "update" }),
  memberController.updateMember,
);

rbacRouter.delete(
  "/restaurants/:restaurantId/members/:memberId",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "delete" }),
  memberController.deleteMember,
);

rbacRouter.patch(
  "/restaurants/:restaurantId/members/:memberId/branches",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "update" }),
  memberController.updateMemberBranches,
);

rbacRouter.get(
  "/roles/:roleName/permissions",
  memberController.getRolePermissions,
);
