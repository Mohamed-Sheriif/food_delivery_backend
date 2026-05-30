import { NextFunction, Request, Response } from "express";
import { productService, ProductService } from "../service/product.service";
import { validateBody } from "../../../lib/validation/validate";
import {
  CreateProductCategoryDTO,
  ProductCategoryParamsDTO,
} from "../dto/product-category.dto";
import {
  BranchProductsParamsDTO,
  CreateProductDTO,
  ProductParamsDTO,
  RestaurantProductsParamsDTO,
  UpdateProductDTO,
  UpdateProductQueryDTO,
} from "../dto/product.dto";

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  createProductCategory = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. validate req.body
      const data = await validateBody(CreateProductCategoryDTO, req.body);

      // 2. validate req.params
      const { restaurantId } = await validateBody(
        ProductCategoryParamsDTO,
        req.params,
      );

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
  };

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(CreateProductDTO, req.body);

      // 2. validate req.params
      const { restaurantId } = await validateBody(
        RestaurantProductsParamsDTO,
        req.params,
      );

      // 3. call service
      const product = await this.productService.createProduct(
        {
          userId: req.user!.userId,
          role: req.user!.role,
        },
        Number(restaurantId),
        data,
      );

      // 4. respond
      res.status(201).json({
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  findAllProductCategoriesByRestaurantId = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. validate req.params
      const { restaurantId } = await validateBody(
        ProductCategoryParamsDTO,
        req.params,
      );

      // 2. call service
      const productCategories =
        await this.productService.findAllProductCategoriesByRestaurantId(
          Number(restaurantId),
        );

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
      const { branchId } = await validateBody(
        BranchProductsParamsDTO,
        req.params,
      );

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

  findByRestaurant = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. validate req.params
      const { restaurantId } = await validateBody(
        RestaurantProductsParamsDTO,
        req.params,
      );

      // 2. call service
      const products = await this.productService.findByRestaurant(
        {
          userId: req.user!.userId,
          role: req.user!.role,
        },
        Number(restaurantId),
      );

      // 3. respond
      res.status(200).json({
        message: "Products found successfully",
        data: products,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { id } = await validateBody(ProductParamsDTO, req.params);

      // 2. call service
      const product = await this.productService.findById(Number(id));

      // 3. respond
      res.status(200).json({
        message: "Product found successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(UpdateProductDTO, req.body);

      // 2. validate req.params
      const { id } = await validateBody(ProductParamsDTO, req.params);

      // 3. validate req.query
      const query = await validateBody(UpdateProductQueryDTO, req.query);

      // 4. call service
      const result = await this.productService.update(
        {
          userId: req.user!.userId,
          role: req.user!.role,
        },
        Number(id),
        data,
        query.branchId ? Number(query.branchId) : undefined,
      );

      // 5. respond
      res.status(200).json({
        message: "Product updated successfully",
        data: {
          product: result.product,
          ...(result.branchDetails && { branchDetails: result.branchDetails }),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}

export const productController = new ProductController(productService);
