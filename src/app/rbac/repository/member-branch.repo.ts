import { Knex } from "knex";
import { MemberBranch } from "../entity/member-branch.entity";
import { db } from "../../../common/knex/knex";

const MEMBER_BRANCH_COLUMNS = ["member_id", "branch_id", "created_at"];

function toEntity(row: any): MemberBranch {
  return new MemberBranch({
    memberId: row.member_id,
    branchId: row.branch_id,
    createdAt: row.created_at,
  });
}

export async function setMemberBranches(
  memberId: number,
  rows: MemberBranch[],
  conn: Knex = db,
): Promise<void> {
  // delete all existing branches for the member
  await conn("member_branches").where("member_id", memberId).delete();

  // insert new branches for the member if rows is not empty
  if (rows.length > 0) {
    await conn("member_branches").insert(
      rows.map((row) => ({
        member_id: memberId,
        branch_id: row.branchId,
        created_at: row.createdAt,
      })),
    );
  }
}

export async function findBranchIdsByMemberId(
  memberId: number,
  conn: Knex = db,
): Promise<number[]> {
  const rows = await conn("member_branches")
    .select("branch_id")
    .where("member_id", memberId);

  return rows.map((row) => Number(row.branch_id));
}

export async function countBranchesByIdsAndRestaurant(
  branchIds: number[],
  restaurantId: number,
  conn: Knex = db,
): Promise<number> {
  const result = await conn("member_branches")
    .whereIn("branch_id", branchIds)
    .where("restaurant_id", restaurantId)
    .count("* as count")
    .first();

  return result ? Number(result.count) : 0;
}
