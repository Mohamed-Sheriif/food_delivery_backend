import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      CREATE TABLE product_categories(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        restaurant_id BIGINT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,

        CONSTRAINT fk_product_categories_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
      );

      CREATE INDEX idx_product_categories_restaurant_id ON product_categories(restaurant_id);
      CREATE UNIQUE INDEX idx_product_categories_name_restaurant_id ON product_categories(name, restaurant_id);
    `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE product_categories;
  `)
}

