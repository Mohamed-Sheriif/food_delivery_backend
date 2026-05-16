import { NextFunction, Request, Response } from "express";
import { productService, ProductService } from "../service/product.service";
import { validateBody } from "../../../common/validation/validate";
import { CreateProductCategoryDTO, ProductCategoryParamsDTO } from "../dto/product-category.dto";
import { BranchProductsParamsDTO } from "../dto/product.dto";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  createProductCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(CreateProductCategoryDTO, req.body);

      // 2. validate req.params
      const { restaurantId } = await validateBody(ProductCategoryParamsDTO, req.params);

      // 3. call service
      const productCategory = await this.productService.createProductCategory(
        {
          userId: req.user!.userId,
          role: req.user!.role,
        },
        Number(restaurantId),
        data,
      );

      // 4. respond
      res.status(201).json({
        message: "Product category created successfully",
        data: productCategory,
      });
    } catch (error) {
      next(error);
    }
  }

  findAllProductCategoriesByRestaurantId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { restaurantId } = await validateBody(ProductCategoryParamsDTO, req.params);

      // 2. call service
      const productCategories = await this.productService.findAllProductCategoriesByRestaurantId(Number(restaurantId));

      // 3. respond
      res.status(200).json({
        message: "Product categories found successfully",
        data: productCategories,
      });
    } catch (error) {
      next(error);
    }
  };

  findByBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { branchId } = await validateBody(BranchProductsParamsDTO, req.params);

      // 2. call service
      const products = await this.productService.findByBranch(Number(branchId));

      // 3. respond
      res.status(200).json({
        message: "Products found successfully",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController(productService);