import { Router } from "express";
import { restaurantController } from "./controller/restaurant.controller";
import { authenticate } from "../../common/auth/guard";

export const restaurantRouter = Router();

restaurantRouter.post("/", authenticate, restaurantController.createWithOwner);
restaurantRouter.get("/", restaurantController.findAll);
restaurantRouter.get("/:id", restaurantController.findById);
restaurantRouter.put("/:id", authenticate, restaurantController.update);
restaurantRouter.put(
  "/:id/status",
  authenticate,
  restaurantController.updateStatus,
);
