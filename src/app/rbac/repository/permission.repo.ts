import { Knex } from "knex";
import { db } from "../../../lib/knex/knex";
import { Permission } from "../entity/permission.entity";

const PERMISSION_COLUMNS = ["id", "resource", "action", "created_at"];

function toEntity(row: any) {
  return new Permission({
    id: row.id,
    resource: row.resource,
    action: row.action,
    createdAt: row.created_at,
  });
}

export async function findPermissionsByRoleName(
  roleName: string,
  conn: Knex = db,
): Promise<string[]> {
  const rows = await conn("permissions as p")
    .select("p.id", "p.resource", "p.action", "p.created_at")
    .join("role_permissions as rp", "p.id", "rp.permission_id")
    .join("roles as r", "rp.role_id", "r.id")
    .where("r.name", roleName)
    .orderBy("p.id", "asc");

  return rows.map((row) => {
    const entity = toEntity(row);
    return `${entity.resource}:${entity.action}`;
  });
}
