import { Router } from "express";
import { restaurantController } from "./controller/restaurant.controller";
import { authenticate } from "../../common/auth/guard";

export const restaurantRouter = Router();

restaurantRouter.post("/", authenticate, restaurantController.createWithOwner);
restaurantRouter.get("/", restaurantController.findAll);
restaurantRouter.get("/:id", restaurantController.findById);
