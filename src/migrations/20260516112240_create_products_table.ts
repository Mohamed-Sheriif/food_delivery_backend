import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      CREATE TABLE products(
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        restaurant_id BIGINT NOT NULL,
        category_id BIGINT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,

        CONSTRAINT fk_products_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
        CONSTRAINT fk_products_category_id FOREIGN KEY (category_id) REFERENCES product_categories(id)
      );

      CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);
      CREATE INDEX idx_products_category_id ON products(category_id);
      CREATE INDEX idx_products_name ON products(name);
    `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE products;
  `);
}

