import { Knex } from "knex";
import { camelToSnake, snakeToCamel } from "../../../pkg/utils/string";

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

export interface CursorPaginationOptions {
  /** Qualified SQL column, e.g. "p.created_at" — required for joined queries */
  sortColumn?: string;
}

export function applyCursorPagination(
  query: Knex.QueryBuilder,
  params: PaginationParams,
  options?: CursorPaginationOptions,
): Knex.QueryBuilder {
  if (!params.sortBy) return query;

  const sortColumn = options?.sortColumn ?? camelToSnake(params.sortBy);

  if (params.cursor) {
    const op = params.sortOrder === "desc" ? "<" : ">";
    query.where(sortColumn, op, params.cursor);
  }

  return query
    .orderBy(sortColumn, params.sortOrder)
    .limit(params.limit + 1);
}

export function applyFilters(
  query: Knex.QueryBuilder,
  filters: FilterParams[],
): Knex.QueryBuilder {
  // convert camelCase fields to snake_case
  filters = filters.map((filter) => ({
    field: camelToSnake(filter.field),
    operator: filter.operator,
    value: filter.value,
  }));

  // apply filters
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
    nextCursor = String(
      lastItem[sortBy] instanceof Date
        ? lastItem[sortBy].toISOString()
        : lastItem[sortBy],
    );
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
