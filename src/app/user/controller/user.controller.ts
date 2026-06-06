import { inject, injectable } from "tsyringe";
import { NextFunction, Request, Response } from "express";

import { UserService } from "../service/user.service";
import { UpdateUserDTO } from "../dto/user.dto";
import { validateBody } from "../../../lib/validation/validate";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";

@injectable()
export class UserController {
  constructor(
    @inject(TOKENS.UserService) private readonly userService: UserService,
  ) {}

  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. get user by userId from the request
      const user = await this.userService.getByUserId(req.user?.userId!);

      // 2. respond with the user data
      sendSuccess(res, user);
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
      sendSuccess(res, {
        message: "User updated successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}
