import { NextFunction, Request, Response } from "express";
import { UserNotAuthenticatedError } from "./errors";
import { verifyAccessToken } from "../../app/auth/utils";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.access_token;

  if (!token) {
    throw new UserNotAuthenticatedError();
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}
