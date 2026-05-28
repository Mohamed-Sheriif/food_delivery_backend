import { Knex } from "knex";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { db } from "../../../common/knex/knex";
import { RestaurantMemberStatus } from "../enums";

const MEMBER_COLUMNS = [
  "id",
  "restaurant_id",
  "user_id",
  "role_id",
  "status",
  "created_at",
  "updated_at",
];
const MEMBER_COLUMNS_WITH_RM_ALIAS = MEMBER_COLUMNS.map((column) => `rm.${column}`);

function toEntity(row: any): RestaurantMember {
  return new RestaurantMember({
    id: row.id,
    restaurantId: row.restaurant_id,
    userId: row.user_id,
    roleId: row.role_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function createRestaurantMember(
  member: Partial<RestaurantMember>,
  conn: Knex = db,
): Promise<RestaurantMember> {
  const [row] = await conn("restaurant_members")
    .insert({
      restaurant_id: member.restaurantId,
      user_id: member.userId,
      role_id: member.roleId,
      status: member.status,
      created_at: member.createdAt,
      updated_at: member.updatedAt,
    })
    .returning(MEMBER_COLUMNS);
  return toEntity(row);
}

export async function activateMemberByUserId(
  userId: number,
  conn: Knex = db,
): Promise<void> {
  await conn("restaurant_members").where("user_id", userId).update({
    status: RestaurantMemberStatus.ACTIVE,
    updated_at: new Date(),
  });
}

export async function findRestaurantMemberById(
  memberId: number,
  conn: Knex = db,
): Promise<RestaurantMember | null> {
  const row = await conn("restaurant_members as rm")
    .select(MEMBER_COLUMNS_WITH_RM_ALIAS)
    .where("rm.id", memberId)
    .first();

  return row ? toEntity(row) : null;
}

export async function findRestaurantMemberWithRole(
  userId: number,
  conn: Knex = db,
): Promise<{
  member: RestaurantMember;
  roleName: string;
} | null> {
  const row = await conn("restaurant_members as rm")
    .select("rm.restaurant_id", "rm.id", "r.name as roleName")
    .leftJoin("roles as r", "rm.role_id", "r.id")
    .where("rm.user_id", userId)
    .andWhere("rm.status", RestaurantMemberStatus.ACTIVE)
    .first();

  return row
    ? {
        member: toEntity(row),
        roleName: row.roleName,
      }
    : null;
}

export async function findMembersByRestaurantId(
  restaurantId: number,
  conn: Knex = db,
): Promise<RestaurantMember[]> {
  const rows = await conn("restaurant_members as rm")
    .select(
      "rm.id",
      "rm.user_id as userId",
      "rm.status",
      "u.email",
      "u.name",
      "u.phone",
      "r.name as role",
      "r.display_name as roleDisplayName",
    )
    .leftJoin("users as u", "rm.user_id", "u.id")
    .leftJoin("roles as r", "rm.role_id", "r.id")
    .where("rm.restaurant_id", restaurantId);

  return rows.map((row) => toEntity(row));
}

export async function findMemberWithRoleName(
  memberId: number,
  conn: Knex = db,
): Promise<{
  member: RestaurantMember;
  roleName: string;
} | null> {
  const row = await conn("restaurant_members as rm")
    .select(MEMBER_COLUMNS_WITH_RM_ALIAS.concat("r.name as roleName"))
    .leftJoin("roles as r", "rm.role_id", "r.id")
    .where("rm.id", memberId)
    .first();

  return row
    ? {
        member: toEntity(row),
        roleName: row.roleName,
      }
    : null;
}

export async function updateMember(
  memberId: number,
  data: { status?: RestaurantMemberStatus; roleId?: number },
  conn: Knex = db,
): Promise<RestaurantMember | null> {
  const payload: Record<string, unknown> = {};

  if (data.status !== undefined) payload.status = data.status;
  if (data.roleId !== undefined) payload.role_id = data.roleId;

  if (Object.keys(payload).length === 0) {
    return findRestaurantMemberById(memberId, conn);
  }

  payload.updated_at = new Date();

  const [row] = await conn("restaurant_members")
    .where("id", memberId)
    .update(payload)
    .returning(MEMBER_COLUMNS);

  return row ? toEntity(row) : null;
}
export async function deleteRestaurantMember(
  memberId: number,
  conn: Knex = db,
): Promise<void> {
  await conn.transaction(async (trx) => {
    await trx("member_branches").where("member_id", memberId).delete();
    await trx("restaurant_members").where("id", memberId).delete();
  });
}
