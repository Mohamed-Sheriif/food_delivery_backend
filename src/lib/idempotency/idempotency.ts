import { NextFunction, Request, Response } from "express";
import { TOKENS } from "../di/tokens";
import { container } from "../di/container";
import { ICacheProvider } from "../../pkg/cache/cache.interface";
import { sendSuccess } from "../http/response";
import {
  IdempotencyKeyRequiredError,
  IdempotencyServiceUnavailableError,
} from "./errors";

const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT"]);
const IDEMPOTENCY_TTL_SECONDS = 3600 * 24;

export interface IdempotencyOptions {
  strict?: boolean;
}

function getIdempotencyKey(req: Request): string | undefined {
  const header = req.headers["idempotency-key"];
  if (!header) return undefined;
  return Array.isArray(header) ? header[0] : header;
}

function buildIdempotencyRedisKey(
  method: string,
  url: string,
  idempotencyKey: string,
): string {
  return `idempotency:${method}:${url}:${idempotencyKey}`;
}

export function idempotency(options?: IdempotencyOptions) {
  const { strict = false } = options ?? {};

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!MUTATION_METHODS.has(req.method)) {
      return next();
    }

    const idempotencyKey = getIdempotencyKey(req);
    if (!idempotencyKey) {
      if (strict) {
        throw new IdempotencyKeyRequiredError();
      }
      return next();
    }

    let cacheProvider: ICacheProvider;
    try {
      cacheProvider = container.resolve<ICacheProvider>(TOKENS.CacheProvider);
    } catch {
      if (strict) {
        throw new IdempotencyServiceUnavailableError();
      }
      return next();
    }

    const redisKey = buildIdempotencyRedisKey(
      req.method,
      req.originalUrl,
      idempotencyKey,
    );

    try {
      const cachedData = await cacheProvider.get(redisKey);
      if (cachedData) {
        res.setHeader("X-Cache", "HIT");
        return sendSuccess(res, JSON.parse(cachedData), 200);
      }
    } catch {
      if (strict) {
        throw new IdempotencyServiceUnavailableError();
      }
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheProvider
          .set(redisKey, JSON.stringify(body), IDEMPOTENCY_TTL_SECONDS)
          .catch(() => {});
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    return next();
  };
}
