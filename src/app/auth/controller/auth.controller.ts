import { NextFunction, Request, Response } from "express";

import {
  daysToMilliseconds,
  hoursToMilliseconds,
} from "../../../pkg/utils/time";
import { validateBody } from "../../../lib/validation/validate";
import {
  ForgetPasswordDTO,
  LoginDTO,
  RegisterDTO,
  ResetPasswordDTO,
} from "../dto/auth.dto";
import { AuthService } from "../service/auth.service";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../../lib/di/tokens";
import { sendSuccess } from "../../../lib/http/response";

@injectable()
export class AuthController {
  constructor(
    @inject(TOKENS.AuthService)
    private readonly authService: AuthService,
  ) {}

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    res.cookie("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: hoursToMilliseconds(1),
    });
    res.cookie("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: daysToMilliseconds(7),
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
      sendSuccess(res, result, 201);
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
      sendSuccess(res, result);
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
      sendSuccess(res, { message: "Email sent." });
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
      sendSuccess(res, {
        message: "Password reset successful, Please login agin.",
      });
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
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. validate req.body
      const data = await validateBody(ResetPasswordDTO, req.body);

      // 2. call service
      await this.authService.acceptInvite(data);

      // 3. respond
      sendSuccess(res, {
        message: "Invitation accepted successfully, Please login agin.",
      });
    } catch (error) {
      next(error);
    }
  };
}
