import { NextFunction, Request, Response } from "express";
import { branchService, BranchService } from "../service/branch.service";
import {
  BranchParamsDTO,
  CreateBranchDTO,
  FindNearbyBranchesDTO,
  UpdateBranchDTO,
  UpdateBranchParamsDTO,
  UpdateBranchStatusDTO,
} from "../dto/branch.dto";
import { validateBody } from "../../../common/validation/validate";

export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  createBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(CreateBranchDTO, req.body);

      // 2. validate req.params
      const { restaurantId } = await validateBody(BranchParamsDTO, req.params);

      // 3. call service
      const branch = await this.branchService.createBranch(
        {
          userId: req.user!.userId,
          role: req.user!.role,
        },
        data,
        Number(restaurantId),
      );

      // 4. respond
      res.status(201).json({
        message: "Branch created successfully",
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  findNearbyBranches = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. validate req.query
      const { lat, lng } = await validateBody(FindNearbyBranchesDTO, req.query);

      // 2. call service
      const branches = await this.branchService.findNearbyBranches(
        Number(lat),
        Number(lng),
      );

      // 3. respond
      res.status(200).json({
        message: "Nearby branches found successfully",
        data: branches,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(UpdateBranchDTO, req.body);

      // 2. validate req.params
      const { id } = await validateBody(UpdateBranchParamsDTO, req.params);

      // 3. call service
      const branch = await this.branchService.updateBranch(
        {
          userId: req.user!.userId,
          role: req.user!.role,
        },
        Number(id),
        data,
      );

      // 4. respond
      res.status(200).json({
        message: "Branch updated successfully",
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };

  updateBranchStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // 1. validate req.body
      const data = await validateBody(UpdateBranchStatusDTO, req.body);

      // 2. validate req.params
      const { id } = await validateBody(UpdateBranchParamsDTO, req.params);

      // 3. call service
      const branch = await this.branchService.updateBranchStatus(
        req.user!.role,
        Number(id),
        data,
      );

      // 4. respond
      res.status(200).json({
        message: "Branch status updated successfully",
        data: branch,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const branchController = new BranchController(branchService);
