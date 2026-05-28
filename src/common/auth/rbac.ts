import { NextFunction, Request, Response } from "express";
import {
  SomethingWentWrongError,
  UnauthorizedError,
  UserNotAuthenticatedError,
} from "./errors";
import { SystemRole } from "../../app/user/enums";
import { permissionCacheService } from "../../app/rbac/service/permission-cache.service";

export interface RBACOptions {
  resource: string;
  action: string;
  allowSystemAdmin?: boolean;
  checkOwnership?: boolean;
}
// example usage: router.post("/products", authenticate, rbac({resource: "products", action: "create"}),productController.create)
export function rbac(options: RBACOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { resource, action, allowSystemAdmin = true } = options;

      // 1. check if req.user exists, if not we will bail
      if (!req.user) {
        throw new UserNotAuthenticatedError();
      }

      // 2. check if system_admim => bypass
      if (allowSystemAdmin && req.user.role === SystemRole.SYSTEM_ADMIN) {
        return next();
      }

      // 3. if restaurant_user, check if they have the permission to do the action
      if (req.user.role === SystemRole.RESTAURANT_USER) {
        const permissions = await permissionCacheService.getPermissions(
          req.user.restaurantRole!,
        );
        if (
          !permissionCacheService.hasPermission(permissions, resource, action)
        ) {
          throw new UnauthorizedError();
        }

        return next();
      }

      throw new UnauthorizedError();
    } catch (error) {
      next(error);
    }
  };
}

export function requireRestaurantMember(paramName: string = "restaurantId") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const restaurantId = parseInt(req.params[paramName] as string);

    if (!restaurantId) {
      throw new SomethingWentWrongError();
    }

    if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
      return next();
    }

    if (Number(req.user?.restaurantId) !== restaurantId) {
      if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
        return next();
      }

      throw new UnauthorizedError();
    }

    return next();
  };
}

export function requireBranchMember(paramName: string = "branchId") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const branchId = parseInt(req.params[paramName] as string);

    if (!branchId) {
      throw new SomethingWentWrongError();
    }

    if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
      return next();
    }

    if (!req.user?.branchIds?.includes(branchId)) {
      if (req.user?.role === SystemRole.SYSTEM_ADMIN) {
        return next();
      }

      throw new UnauthorizedError();
    }

    return next();
  };
}
