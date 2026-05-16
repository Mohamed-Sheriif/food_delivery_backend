import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_product_categories_name_restaurant_id;

    CREATE UNIQUE INDEX idx_product_categories_restaurant_name_ci
    ON product_categories (restaurant_id, LOWER(name))
    WHERE deleted_at IS NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_product_categories_restaurant_name_ci;

    CREATE UNIQUE INDEX idx_product_categories_name_restaurant_id
    ON product_categories (name, restaurant_id);
  `);
}
