import { FilterParams, PaginationParams } from "./cursor-pagination";

export function parsePaginationQuery(
  query: Record<string, any>,
  allowedSortByFields: string[],
): PaginationParams {
  const sortBy = allowedSortByFields.includes(query.sortBy as string)
    ? (query.sortBy as string)
    : allowedSortByFields[0];

  return {
    cursor: query.cursor as string,
    limit: Math.min(1000, Number(query.limit ?? 1000)),
    sortBy,
    sortOrder: query.sortOrder === "desc" ? "desc" : "asc",
  };
}

// filters
// GET /api/products?filters[name][eq]=John&filters[age][gt]=30&filters[email][like]=example.com
// {
//   filters: {
//     name: { eq: "John" },
//     age: { gt: 30 },
//     email: { like: "example.com" },
//   },
// }

export function parseFilters(
  query: Record<string, any>,
  allowedFields: string[],
): FilterParams[] {
  // 1. check if filters exist and is an object
  const filters = query.filters;
  if (!filters || typeof filters !== "object") return [];

  // 2. define allowed operators
  const allowedOperators = new Set([
    "eq",
    "neq",
    "gt",
    "gte",
    "lt",
    "lte",
    "like",
    "ilike",
    "in",
    "notIn",
    "isNull",
  ]);

  // 3. iterate over allowed fields and parse filters for each field
  // output will be like this: [
  //   { field: "name", operator: "eq", value: "John" },
  //   { field: "age", operator: "gt", value: 30 },
  //   { field: "email", operator: "like", value: "%example.com" },
  // ]
  return allowedFields.flatMap((field) => {
    const fieldFilters = filters[field];
    if (!fieldFilters || typeof fieldFilters !== "object") return [];

    return Object.entries(fieldFilters)
      .filter(([op]) => allowedOperators.has(op))
      .map(([operator, value]) => {
        return {
          field,
          operator: operator as FilterParams["operator"],
          value: value as string | string[],
        };
      });
  });
}
