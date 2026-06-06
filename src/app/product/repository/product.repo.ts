import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { BranchProduct } from "../entity/branch-product.entity";
import { Product } from "../entity/product.entity";
import {
  applyCursorPagination,
  applyFilters,
  FilterParams,
  PaginationParams,
} from "../../../lib/http/pagination/cursor-pagination";

const BRANCH_PRODUCT_SORT_COLUMNS: Record<string, string> = {
  createdAt: "p.created_at",
  id: "p.id",
};

const PRODUCT_COLUMNS = [
  "id",
  "name",
  "description",
  "image_url",
  "restaurant_id",
  "category_id",
  "created_at",
  "updated_at",
  "deleted_at",
];

function toProductEntity(row: {
  id: number;
  name: string;
  description: string;
  image_url: string;
  restaurant_id: number;
  category_id: number;
  created_at: Date;
  updated_at: Date;
}): Product {
  return new Product({
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

function toBranchProductEntity(row: {
  id: number;
  name: string;
  description: string;
  image_url: string;
  restaurant_id: number;
  category_id: number;
  category_name: string;
  price: string | number;
  stock: number;
  is_available: boolean;
  created_at: Date;
}): BranchProduct {
  return new BranchProduct({
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    restaurantId: row.restaurant_id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    price: Number(row.price),
    stock: row.stock,
    isAvailable: row.is_available,
    createdAt: row.created_at,
  });
}

export async function createProduct(
  product: Partial<Product>,
  conn: Knex = db,
): Promise<Product> {
  const [row] = await conn("products")
    .insert({
      name: product.name,
      description: product.description,
      image_url: product.imageUrl,
      restaurant_id: product.restaurantId,
      category_id: product.categoryId,
      created_at: product.createdAt,
      updated_at: product.updatedAt,
    })
    .returning(PRODUCT_COLUMNS);

  return toProductEntity(row);
}

export async function findProductsByBranch(
  branchId: number,
  filters: FilterParams[],
  pagination: PaginationParams,
): Promise<BranchProduct[]> {
  // start with the base query
  let query = db("products as p")
    .select(
      "p.id",
      "p.name",
      "p.description",
      "p.image_url",
      "p.restaurant_id",
      "p.category_id",
      "pc.name as category_name",
      "pbd.price",
      "pbd.stock",
      "pbd.is_available",
      "p.created_at",
    )
    .innerJoin("product_branch_details as pbd", "pbd.product_id", "p.id")
    .innerJoin("product_categories as pc", "pc.id", "p.category_id")
    .where("pbd.branch_id", branchId)
    .whereNull("p.deleted_at")
    .whereNull("pbd.deleted_at")
    .whereNull("pc.deleted_at");

  // apply filters if any
  if (filters.length > 0) {
    query = applyFilters(query, filters);
  }

  // apply pagination if any
  if (pagination !== undefined) {
    query = applyCursorPagination(query, pagination, {
      sortColumn: BRANCH_PRODUCT_SORT_COLUMNS[pagination.sortBy],
    });
  }

  // execute query and return the result
  const rows = await query;

  return rows.map(toBranchProductEntity);
}

export async function findProductsByRestaurant(
  restaurantId: number,
  filters: FilterParams[],
  pagination: PaginationParams,
): Promise<Product[]> {
  // start with the base query
  let query = db("products")
    .select(PRODUCT_COLUMNS)
    .where("restaurant_id", restaurantId)
    .whereNull("deleted_at");

  // apply filters if any
  if (filters.length > 0) {
    query = applyFilters(query, filters);
  }

  // apply pagination if any
  if (pagination !== undefined) {
    query = applyCursorPagination(query, pagination);
  }

  // execute query and return the result
  const rows = await query;

  return rows.map(toProductEntity);
}

export async function findProductById(
  id: number,
  conn: Knex = db,
): Promise<Product | undefined> {
  const row = await conn("products")
    .select(PRODUCT_COLUMNS)
    .where("id", id)
    .whereNull("deleted_at")
    .first();

  return row ? toProductEntity(row) : undefined;
}

export async function updateProduct(
  id: number,
  product: Partial<Product>,
  conn: Knex = db,
): Promise<Product | undefined> {
  const payload: Record<string, unknown> = {};

  if (product.name !== undefined) payload.name = product.name;
  if (product.description !== undefined)
    payload.description = product.description;
  if (product.imageUrl !== undefined) payload.image_url = product.imageUrl;
  if (product.categoryId !== undefined)
    payload.category_id = product.categoryId;

  if (Object.keys(payload).length === 0) {
    return findProductById(id, conn);
  }

  payload.updated_at = new Date();

  const [row] = await conn("products")
    .where("id", id)
    .whereNull("deleted_at")
    .update(payload)
    .returning(PRODUCT_COLUMNS);

  return row ? toProductEntity(row) : undefined;
}
