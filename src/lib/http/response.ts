import { Response } from "express";

export interface ApiResponse<T = unknown, M = Record<string, unknown>> {
  success: boolean;
  data?: T;
  meta?: M;
}

export interface PaginationMeta {
  nextCursor: number | null;
  hasMore: boolean;
  count: number;
}

export function sendSuccess<T, M = Record<string, unknown>>(
  res: Response,
  data: T,
  statusCode: number = 200,
  meta?: M,
) {
  const body: ApiResponse<T, M> = {
    success: true,
    data,
  };

  if (meta !== undefined) body.meta = meta;

  res.status(statusCode).json(body);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
) {
  sendSuccess(res, data, 200, meta);
}
