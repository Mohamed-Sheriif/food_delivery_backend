import { Knex } from "knex";
import { db } from "../../../common/knex/knex";
import { ProductCategory } from "../entity/product-category.entity";

const PRODUCT_CATEGORY_COLUMNS = [
  "id",
  "name",
  "restaurant_id",
  "created_at",
  "updated_at",
  "deleted_at",
];

function toEntity(row: any) {
  return new ProductCategory({
    id: row.id,
    name: row.name,
    restaurantId: row.restaurant_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function createProductCategory(
  productCategory: Partial<ProductCategory>,
  conn: Knex= db
): Promise<ProductCategory> {
  const [row] = await conn("product_categories")
    .insert({
      name: productCategory.name,
      restaurant_id: productCategory.restaurantId,
      created_at: productCategory.createdAt,
      updated_at: productCategory.updatedAt,
    })
    .returning(PRODUCT_CATEGORY_COLUMNS);

  return toEntity(row);
}

export async function findAllProductCategoriesByRestaurantId(
  restaurantId: number
): Promise<ProductCategory[]> {
  const rows = await db("product_categories")
    .select(PRODUCT_CATEGORY_COLUMNS)
    .where("restaurant_id", restaurantId)
    .whereNull("deleted_at")

  return rows.map(toEntity);
}

export async function findProductCategoryByRestaurantIdAndName(
  restaurantId: number,
  normalizedName: string,
): Promise<ProductCategory | undefined> {
  const row = await db("product_categories")
    .select(PRODUCT_CATEGORY_COLUMNS)
    .where("restaurant_id", restaurantId)
    .whereRaw("LOWER(name) = ?", [normalizedName])
    .whereNull("deleted_at")
    .first();

  return row ? toEntity(row) : undefined;
}