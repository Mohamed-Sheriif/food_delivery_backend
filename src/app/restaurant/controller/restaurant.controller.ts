import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";

import { RestaurantService } from "../service/restaurant.service";
import { validateBody } from "../../../lib/validation/validate";
import {
  CreateRestaurantWithOwnerDTO,
  RestaurantParamsDTO,
  UpdateRestauranDTO,
  UpdateRestaurantStatusDTO,
} from "../dto/restaurant.dto";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";

@injectable()
export class RestaurantController {
  constructor(
    @inject(TOKENS.RestaurantService)
    private readonly restaurantService: RestaurantService,
  ) {}

  createWithOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(CreateRestaurantWithOwnerDTO, req.body);

      // 2. call service
      const result = await this.restaurantService.createWithOwner(
        req.user!.role,
        data,
      );

      // 3. respond with the result
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. call service
      const restaurants = await this.restaurantService.findAll();

      // 2. respond with the restaurants data
      sendSuccess(res, {
        message: "Restaurants retrieved successfully",
        data: restaurants,
      });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { id } = await validateBody(RestaurantParamsDTO, req.params);

      // 2. call service
      const restaurant = await this.restaurantService.findById(Number(id));

      // 3. respond with the restaurant data
      sendSuccess(res, {
        message: "Restaurant found successfully",
        restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { id } = await validateBody(RestaurantParamsDTO, req.params);

      // 2. validate req.body
      const data = await validateBody(UpdateRestauranDTO, req.body);

      // 3. call service
      const restaurant = await this.restaurantService.update(
        {
          userId: req.user!.userId,
          role: req.user!.role,
        },
        Number(id),
        data,
      );

      // 4. respond with the restaurant data
      sendSuccess(res, {
        message: "Restaurant updated successfully",
        restaurant,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.params
      const { id } = await validateBody(RestaurantParamsDTO, req.params);

      // 2. validate req.body
      const data = await validateBody(UpdateRestaurantStatusDTO, req.body);

      // 3. call service
      const restaurant = await this.restaurantService.updateStatus(
        req.user!.role,
        Number(id),
        data,
      );

      // 4. respond with the restaurant data
      sendSuccess(res, {
        message: "Restaurant status updated successfully",
        restaurant,
      });
    } catch (error) {
      next(error);
    }
  };
}
