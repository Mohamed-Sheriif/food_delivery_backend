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

// create restaurant with owner
restaurantRouter.post("/", authenticate, restaurantController.createWithOwner);

// list restaurants
restaurantRouter.get("/", restaurantController.findAll);

// get restaurant by id
restaurantRouter.get("/:id", restaurantController.findById);

// update restaurant
restaurantRouter.put(
  "/:id",
  authenticate,
  requireRestaurantMember("id"),
  rbac({ resource: "core:restaurant", action: "update" }),
  restaurantController.update,
);

// update restaurant status
restaurantRouter.put(
  "/:id/status",
  authenticate,
  restaurantController.updateStatus,
);
