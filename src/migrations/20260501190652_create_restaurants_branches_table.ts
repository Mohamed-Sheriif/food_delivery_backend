import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS postgis;

    CREATE TYPE currency_enum AS ENUM ('EGP' , 'SAR');

    CREATE TABLE restaurants_branches(
      id SERIAL PRIMARY KEY,
      restaurant_id BIGINT NOT NULL,
      country_code TEXT NOT NULL,
      address_text TEXT NOT NULL,
      label TEXT NOT NULL,
      lat DECIMAL(9,6) NOT NULL,
      lng DECIMAL(9,6) NOT NULL,
      location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (ST_MakePoint(lng::float, lat::float)::GEOGRAPHY) STORED,
      is_active BOOLEAN NOT NULL DEFAULT FALSE,
      opens_at TIME NOT NULL,
      closes_at TIME NOT NULL,
      accept_orders BOOLEAN NOT NULL DEFAULT TRUE,
      delivery_radius SMALLINT NOT NULL,
      currency currency_enum NOT NULL DEFAULT 'EGP',
      commission INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP,

      CONSTRAINT fk_restaurants_branches_restaurant_id FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)

    );

    CREATE INDEX idx_restaurants_branches_restaurant_id ON restaurants_branches(restaurant_id);
    CREATE INDEX idx_restaurants_branches_is_active ON restaurants_branches(is_active);
    CREATE INDEX idx_restaurants_branches_location ON restaurants_branches USING GIST (location);

    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP TABLE restaurants_branches;
    DROP TYPE currency_enum;
  `);
}
