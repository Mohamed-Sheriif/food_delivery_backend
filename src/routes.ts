import { Router } from "express";
import { authRouter } from "./app/auth/routes";
import { customerAddressRouter } from "./app/customer-address/routes";
import { healthRouter } from "./app/health/health.routes";
import { userRouter } from "./app/user/routes";
import { restaurantRouter } from "./app/restaurant/routes";
import { branchRouter } from "./app/branch/routes";
import { productRouter } from "./app/product/routes";
import { rbacRouter } from "./app/rbac/routes";

export const routes = Router();

routes.use("/health", healthRouter);

// user
routes.use("/user", userRouter);

// auth
routes.use("/auth", authRouter);

// customer addresses
routes.use("/customer-addresses", customerAddressRouter);

// product categories
routes.use("/", productRouter);

// branch
routes.use("/", branchRouter);

// rbac
routes.use("/", rbacRouter);

// restaurant
routes.use("/restaurants", restaurantRouter);
