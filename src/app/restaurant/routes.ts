import { Router } from "express";
import { RestaurantController } from "./controller/restaurant.controller";
import { authenticate } from "../../lib/auth/guard";
import { rbac, requireRestaurantMember } from "../../lib/auth/rbac";
import { container } from "../../lib/di/container";
import { TOKENS } from "../../lib/di/tokens";

export const restaurantRouter = Router();

const restaurantController = container.resolve<RestaurantController>(
  TOKENS.RestaurantController,
);

restaurantRouter.post("/", authenticate, restaurantController.createWithOwner);
restaurantRouter.get("/", restaurantController.findAll);
restaurantRouter.get("/:id", restaurantController.findById);
restaurantRouter.put(
  "/:id",
  authenticate,
  requireRestaurantMember("id"),
  rbac({ resource: "core:restaurant", action: "update" }),
  restaurantController.update,
);
restaurantRouter.put(
  "/:id/status",
  authenticate,
  restaurantController.updateStatus,
);
