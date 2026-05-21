import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
      CREATE TABLE product_branch_details(
        id SERIAL PRIMARY KEY,
        product_id BIGINT NOT NULL,
        branch_id BIGINT NOT NULL,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        stock INT NOT NULL DEFAULT 0,
        is_available BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,

        CONSTRAINT fk_product_branch_details_product_id FOREIGN KEY (product_id) REFERENCES products(id),
        CONSTRAINT fk_product_branch_details_branch_id FOREIGN KEY (branch_id) REFERENCES restaurants_branches(id)
      );

      CREATE INDEX idx_product_branch_details_product_id ON product_branch_details(product_id);
      CREATE INDEX idx_product_branch_details_branch_id ON product_branch_details(branch_id);
    `);
}


export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE product_branch_details;
  `);
}

