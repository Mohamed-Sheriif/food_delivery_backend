import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE UNIQUE INDEX idx_customer_addresses_one_default_per_user
    ON customer_addresses (user_id)
    WHERE is_default = true AND deleted_at IS NULL;
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP INDEX IF EXISTS idx_customer_addresses_one_default_per_user;
  `);
}
