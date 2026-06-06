import { Router } from "express";
import { MemberController } from "./controller/member.controller";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";

export const rbacRouter = Router();

const memberController = container.resolve<MemberController>(
  TOKENS.MemberController,
);

// create restaurant member
rbacRouter.post(
  "/restaurants/:restaurantId/members",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "create" }),
  memberController.createMember,
);

// list restaurant members
rbacRouter.get(
  "/restaurants/:restaurantId/members",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "read" }),
  memberController.listMembers,
);

// update restaurant member
rbacRouter.patch(
  "/restaurants/:restaurantId/members/:memberId",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "update" }),
  memberController.updateMember,
);

// delete restaurant member
rbacRouter.delete(
  "/restaurants/:restaurantId/members/:memberId",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "delete" }),
  memberController.deleteMember,
);

// update restaurant member branches
rbacRouter.patch(
  "/restaurants/:restaurantId/members/:memberId/branches",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:member", action: "update" }),
  memberController.updateMemberBranches,
);

// get role permissions
rbacRouter.get(
  "/roles/:roleName/permissions",
  memberController.getRolePermissions,
);
