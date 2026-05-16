import { Router } from "express";
import { productController } from "./controller/product.controller";
import { authenticate } from "../../common/auth/guard";

export const productRouter = Router();

productRouter.post("/restaurants/:restaurantId/categories", authenticate, productController.createProductCategory);
productRouter.get("/restaurants/:restaurantId/categories", productController.findAllProductCategoriesByRestaurantId);