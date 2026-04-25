import { NextFunction, Request, Response } from "express";

import { validateBody } from "../../../common/validation/validate";
import {
  ForgetPasswordDTO,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
} from "../dto/auth.dto";
import { AuthService, authService } from "../service/auth.service";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
      path: "/api/auth/refresh-token", // restrict refresh token to this path
    });
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(RegisterDTO, req.body);

      // 2. call service
      const result = await this.authService.register(data);

      // 3. set cookies
      this.setAuthCookies(res, result);

      // 4. respond
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(LoginDTO, req.body);

      // 2. call service
      const result = await this.authService.login(data);

      // 3. set cookies
      this.setAuthCookies(res, result);

      // 4. respond
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(ForgetPasswordDTO, req.body);

      // 2. call service
      await this.authService.forgetPassword(data.email);

      // 3. respond
      res.status(200).json({ message: "Email sent." });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(ResetPasswordDTO, req.body);

      // 2. call service
      await this.authService.resetPassword(data);

      // 3. respond
      res
        .status(200)
        .json({ message: "Password reset successful, Please login agin." });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. get refresh token from cookies
      const refreshToken = req.cookies.refresh_token;

      // 2. call service
      const result = await this.authService.refreshToken(refreshToken);

      // 3. set cookies
      this.setAuthCookies(res, result);

      // 4. respond
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController(authService);
