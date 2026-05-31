import { NextFunction, Request, Response } from "express";
import { ICacheProvider } from "../../pkg/cache/cache.interface";
import { container } from "../di/container";
import { TOKENS } from "../di/tokens";

export function withCache(ttl = 3600, userScoped = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. get the cache provider
      const cacheProvider: ICacheProvider = container.resolve(
        TOKENS.CacheProvider,
      );

      // 2. build the cache key
      let key = `${req.method}:${req.originalUrl}`;
      if (userScoped) {
        key = `${key}:${req.user?.userId}`;
      }

      // 3. check if the data is cached
      const cachedData = await cacheProvider.get(key);
      if (cachedData) {
        // 3.1. if the data is cached, return the cached data
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cachedData));
      }

      // 4. if the data is not cached, intercept the response and cache the data with keeping the original json method
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheProvider.set(key, JSON.stringify(body), ttl);
        }
        res.setHeader("X-Cache", "MISS");
        return originalJson(body);
      };

      // 5. call the next middleware
      return next();
    } catch (error) {
      next(error);
    }
  };
}
