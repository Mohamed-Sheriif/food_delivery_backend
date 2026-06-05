import { Knex } from "knex";
import { snakeToCamel } from "../../../pkg/utils/string";

export interface PaginationParams {
  cursor?: string;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface FilterParams {
  field: string;
  operator:
    | "eq"
    | "neq"
    | "gt"
    | "gte"
    | "lt"
    | "lte"
    | "like"
    | "ilike"
    | "in"
    | "notIn"
    | "isNull";
  value: string | string[];
}

export interface PaginationMeta {
  nextCursor: string | null;
  hasMore: boolean;
  count: number;
}

export function applyCursorPagination<T>(
  query: Knex.QueryBuilder,
  params: PaginationParams,
): Knex.QueryBuilder {
  if (!params.sortBy) return query;

  if (params.cursor) {
    const op = params.sortOrder === "desc" ? "<" : ">";
    query.where(params.sortBy, op, params.cursor);
  }

  return query.orderBy(params.sortBy, params.sortOrder).limit(params.limit + 1);
}

function getCursorValue(
  item: Record<string, unknown>,
  sortBy: string,
): string | null {
  const value = item[sortBy] ?? item[snakeToCamel(sortBy)];
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function applyFilters(
  query: Knex.QueryBuilder,
  filters: FilterParams[],
): Knex.QueryBuilder {
  for (const filter of filters) {
    switch (filter.operator) {
      case "eq":
        query.where(filter.field, filter.value);
        break;
      case "neq":
        query.where(filter.field, "!=", filter.value);
        break;
      case "gt":
        query.where(filter.field, ">", filter.value);
        break;
      case "gte":
        query.where(filter.field, ">=", filter.value);
        break;
      case "lt":
        query.where(filter.field, "<", filter.value);
        break;
      case "lte":
        query.where(filter.field, "<=", filter.value);
        break;
      case "like":
        query.where(filter.field, "like", `%${filter.value}%`);
        break;
      case "ilike":
        query.where(filter.field, "ilike", `%${filter.value}%`);
        break;
      case "in":
        query.whereIn(
          filter.field,
          Array.isArray(filter.value) ? filter.value : [filter.value],
        );
        break;
      case "notIn":
        query.whereNotIn(
          filter.field,
          Array.isArray(filter.value) ? filter.value : [filter.value],
        );
        break;
      case "isNull":
        query.whereNull(filter.field);
        break;
    }
  }

  return query;
}

export function buildPaginationResult<T>(
  rows: T[],
  limit: number,
  sortBy: string,
): { data: T[]; meta: PaginationMeta } {
  const hasMore = rows.length > limit;
  const data: T[] = hasMore ? rows.slice(0, limit) : rows;
  let nextCursor: string | null = null;

  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1] as Record<string, unknown>;
    nextCursor = getCursorValue(lastItem, sortBy);
  }

  return {
    data,
    meta: {
      nextCursor,
      hasMore,
      count: rows.length,
    },
  };
}
