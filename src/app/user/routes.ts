import { Router } from "express";
import { UserController } from "./controller/user.controller";
import { authenticate } from "../../lib/auth/guard";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";

export const userRouter = Router();

const userController = container.resolve<UserController>(TOKENS.UserController);

userRouter.get("/me", authenticate, userController.getMe);
userRouter.patch("/me", authenticate, userController.updateMe);
