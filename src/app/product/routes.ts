import { Router } from "express";
import { productController } from "./controller/product.controller";
import { authenticate } from "../../common/auth/guard";
import {
  rbac,
  requireBranchMember,
  requireRestaurantMember,
} from "../../common/auth/rbac";

export const productRouter = Router();

productRouter.post(
  "/restaurants/:restaurantId/products",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:product", action: "create" }),
  productController.createProduct,
);
productRouter.get(
  "/restaurants/:restaurantId/products",
  authenticate,
  requireRestaurantMember("restaurantId"),
  rbac({ resource: "core:product", action: "read" }),
  productController.findByRestaurant,
);
productRouter.get(
  "/branches/:branchId/products",
  productController.findByBranch,
);
productRouter.get("/products/:id", productController.findById);
productRouter.patch(
  "/products/:id",
  authenticate,
  requireBranchMember("branchId"),
  rbac({ resource: "core:product", action: "update" }),
  productController.update,
);

productRouter.post(
  "/restaurants/:restaurantId/categories",
  authenticate,
  productController.createProductCategory,
);
productRouter.get(
  "/restaurants/:restaurantId/categories",
  productController.findAllProductCategoriesByRestaurantId,
);
