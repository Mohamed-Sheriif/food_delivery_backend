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
