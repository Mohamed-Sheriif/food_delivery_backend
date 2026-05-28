import { Router } from "express";
import { restaurantController } from "./controller/restaurant.controller";
import { authenticate } from "../../common/auth/guard";
import { rbac, requireRestaurantMember } from "../../common/auth/rbac";

export const restaurantRouter = Router();

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
