import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { Role } from "../entity/role.entity";

export const ROLE_COLUMNS = [
  "id",
  "name",
  "display_name",
  "description",
  "created_at",
  "updated_at",
];

function toEntity(row: any) {
  return new Role({
    id: row.id,
    name: row.name,
    displayName: row.display_name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function findRoleByName(
  name: string,
  conn: Knex = db,
): Promise<number | undefined> {
  const rows = await conn("roles").select("id").where("name", name);

  if (rows.length === 0) {
    return undefined;
  }

  return Number(rows[0].id);
}
