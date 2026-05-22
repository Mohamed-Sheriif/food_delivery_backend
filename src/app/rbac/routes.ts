import { Router } from "express";
import { memberController } from "./controller/member.controller";
import { authenticate } from "../../common/auth/guard";

export const rbacRouter = Router();

rbacRouter.post(
  "/restaurants/:restaurantId/members",
  authenticate,
  memberController.createMember,
);
