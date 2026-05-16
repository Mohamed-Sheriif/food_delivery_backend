import { db } from "../../../common/knex/knex";
import { BranchProduct } from "../entity/branch-product.entity";

function toEntity(row: {
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
  });
}

export async function findProductsByBranch(
  branchId: number,
): Promise<BranchProduct[]> {
  const rows = await db("products as p")
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
    )
    .innerJoin("product_branch_details as pbd", "pbd.product_id", "p.id")
    .innerJoin("product_categories as pc", "pc.id", "p.category_id")
    .where("pbd.branch_id", branchId)
    .whereNull("p.deleted_at")
    .whereNull("pbd.deleted_at")
    .whereNull("pc.deleted_at");

  return rows.map(toEntity);
}
