import { NextFunction, Request, Response } from "express";
import { userService, UserService } from "../service/user.service";
import { UpdateUserDTO } from "../dto/user.dto";
import { validateBody } from "../../../lib/validation/validate";

export class UserController {
  constructor(private userService: UserService) {}

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. get user by userId from the request
      const user = await this.userService.getByUserId(req.user?.userId!);

      // 2. respond with the user data
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate the request body
      const data = await validateBody(UpdateUserDTO, req.body);

      // 2. update the user
      const user = await this.userService.updateUser(req.user?.userId!, data);

      // 3. respond with the updated user data
      res.status(200).json({
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const userController = new UserController(userService);
