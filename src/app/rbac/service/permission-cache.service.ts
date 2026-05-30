import { injectable } from "tsyringe";

import { minutesToMilliseconds } from "../../../pkg/utils/time";
import { findPermissionsByRoleName } from "../repository/permission.repo";

@injectable()
export class PermissionCacheService {
  private cache: Map<string, { permissions: string[]; cachedAt: number }> =
    new Map();
  private readonly TTL = minutesToMilliseconds(60);

  async getPermissions(roleName: string): Promise<string[]> {
    // 1. check if the roleName is in the cache, if exist return it
    const cached = this.cache.get(roleName);
    if (cached && Date.now() - cached.cachedAt < this.TTL) {
      return cached.permissions;
    }

    // 2. if not in cache, fetch from database and cache it
    const permissions = await findPermissionsByRoleName(roleName);
    this.cache.set(roleName, { permissions, cachedAt: Date.now() });

    return permissions;
  }

  hasPermission(
    permissions: string[],
    resource: string,
    action: string,
  ): boolean {
    return permissions.includes(`${resource}:${action}`);
  }
}
