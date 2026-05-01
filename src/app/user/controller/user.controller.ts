import { NextFunction, Request, Response } from "express";
import { userService, UserService } from "../service/user.service";

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
}

export const userController = new UserController(userService);
