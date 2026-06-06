import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      CREATE OR REPLACE FUNCTION fn_product_after_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO product_branch_details(product_id, branch_id, price, stock, is_available)
        SELECT 
          NEW.id,
          rb.id,
          0,
          0,
          FALSE
        FROM restaurants_branches rb
        WHERE rb.restaurant_id = NEW.restaurant_id
          AND rb.deleted_at IS NULL;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trg_product_after_insert
      AFTER INSERT ON products
      FOR EACH ROW
      EXECUTE FUNCTION fn_product_after_insert();
    `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TRIGGER IF EXISTS trg_product_after_insert ON products;
    DROP FUNCTION IF EXISTS fn_product_after_insert();
  `);
}

