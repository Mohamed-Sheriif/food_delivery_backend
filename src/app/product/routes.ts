import { Router } from "express";
import { productController } from "./controller/product.controller";
import { authenticate } from "../../common/auth/guard";

export const productRouter = Router();

productRouter.post("/restaurants/:restaurantId/products", authenticate, productController.createProduct);
productRouter.post("/restaurants/:restaurantId/categories", authenticate, productController.createProductCategory);
productRouter.get("/restaurants/:restaurantId/categories", productController.findAllProductCategoriesByRestaurantId);
productRouter.get("/branches/:branchId/products", productController.findByBranch);
productRouter.get(
  "/restaurants/:restaurantId/products",
  authenticate,
  productController.findByRestaurant,
);
productRouter.get("/products/:id", productController.findById);
productRouter.patch("/products/:id", authenticate, productController.update);