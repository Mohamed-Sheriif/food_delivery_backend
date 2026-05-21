import { Knex } from "knex";
import { db } from "../../../common/knex/knex";
import { ProductBranchDetails } from "../entity/product-branch-details.entity";

const PRODUCT_BRANCH_DETAILS_COLUMNS = [
  "id",
  "product_id",
  "branch_id",
  "price",
  "stock",
  "is_available",
  "created_at",
  "updated_at",
  "deleted_at",
];

function toEntity(row: {
  id: number;
  product_id: number;
  branch_id: number;
  price: string | number;
  stock: number;
  is_available: boolean;
  created_at: Date;
  updated_at: Date;
}): ProductBranchDetails {
  return new ProductBranchDetails({
    id: row.id,
    productId: row.product_id,
    branchId: row.branch_id,
    price: Number(row.price),
    stock: row.stock,
    isAvailable: row.is_available,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function findProductBranchDetailsByProductAndBranch(
  productId: number,
  branchId: number,
  conn: Knex = db,
): Promise<ProductBranchDetails | undefined> {
  const row = await conn("product_branch_details")
    .select(PRODUCT_BRANCH_DETAILS_COLUMNS)
    .where("product_id", productId)
    .where("branch_id", branchId)
    .whereNull("deleted_at")
    .first();

  return row ? toEntity(row) : undefined;
}

export async function updateBranchDetails(
  productId: number,
  branchId: number,
  details: Partial<ProductBranchDetails>,
  conn: Knex = db,
): Promise<ProductBranchDetails | undefined> {
  const payload: Record<string, unknown> = {};

  if (details.price !== undefined) payload.price = details.price;
  if (details.stock !== undefined) payload.stock = details.stock;
  if (details.isAvailable !== undefined)
    payload.is_available = details.isAvailable;

  if (Object.keys(payload).length === 0) {
    return findProductBranchDetailsByProductAndBranch(productId, branchId, conn);
  }

  payload.updated_at = new Date();

  const [row] = await conn("product_branch_details")
    .where("product_id", productId)
    .where("branch_id", branchId)
    .whereNull("deleted_at")
    .update(payload)
    .returning(PRODUCT_BRANCH_DETAILS_COLUMNS);

  return row ? toEntity(row) : undefined;
}
