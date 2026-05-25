import { AppError } from "../../../common/error/AppError";
import { db } from "../../../common/knex/knex";
import { minutesToMilliseconds } from "../../../common/time/time";
import { UserAlreadyExistsError } from "../../auth/errors";
import { createPasswordReset } from "../../auth/repository/password-reset-repo";
import { generateOTP, hashOTP } from "../../auth/utils";
import { findBranchesByIds } from "../../branch/repository/branch.repo";
import { RestaurantNotFoundError } from "../../restaurant/errors";
import { findRestaurantById } from "../../restaurant/repository/restaurant.repo";
import { User } from "../../user/entity/user.entity";
import { SystemRole } from "../../user/enums";
import {
  createUser,
  findUserExistsByEmailOrPhone,
} from "../../user/repository/users.repo";
import { CreateMemberDto } from "../dto/member.dto";
import { MemberBranch } from "../entity/member-branch.entity";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { RestaurantMemberStatus } from "../enums";
import { CannotCreateOwnerMemberError, RoleNotFoundError } from "../errors";
import { setMemberBranches } from "../repository/member-branch.repo";
import { createRestaurantMember } from "../repository/restaurant-member.repo";
import { findRoleByName } from "../repository/role.repo";

export class MemberService {
  createMember = async (restaurantId: number, data: CreateMemberDto) => {
    // 1. don't accept owner role creation
    if (data.role === "owner") {
      throw CannotCreateOwnerMemberError;
    }

    // 2. check if member already exists
    const existing = await findUserExistsByEmailOrPhone(data.email, data.phone);
    if (existing) {
      throw UserAlreadyExistsError;
    }
    // 3. find roleId by role name
    const roleId = await findRoleByName(data.role);
    if (!roleId) {
      throw RoleNotFoundError;
    }

    // 4. find restaurant by id
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw RestaurantNotFoundError;
    }

    const now = new Date();
    const trx = await db.transaction();
    let user: User;
    let member: RestaurantMember;
    // 5. create user, member and assign branches if provided
    try {
      // 5.1. create user
      user = await createUser(
        {
          email: data.email,
          phone: data.phone,
          name: data.name,
          systemRole: SystemRole.RESTAURANT_USER,
          passwordHash: "",
          createdAt: now,
          updatedAt: now,
        },
        trx,
      );

      // 5.2. create member
      member = await createRestaurantMember(
        {
          restaurantId: restaurantId,
          userId: user.id,
          roleId: roleId,
          status: RestaurantMemberStatus.INACTIVE,
          createdAt: now,
          updatedAt: now,
        },
        trx,
      );

      // 5.3. assign branches if provided
      if (data.branches) {
        // 5.3.1. remove duplicates if exists
        const uniqueBranches = [...new Set(data.branches)];

        // 5.3.2. find branches by ids
        const branches = await findBranchesByIds(uniqueBranches);
        const existingIds = branches.map((branch) => branch.id);
        const missingIds = uniqueBranches.filter(
          (id) => !existingIds.includes(id),
        );
        if (missingIds.length > 0) {
          throw new AppError(
            `Branch(s) ${missingIds.join(", ")} not found`,
            404,
          );
        }

        // 5.3.3. validate branches belong to the restaurant
        const branchesDoesNotBelongToRestaurant = branches.filter(
          (branch) => branch.restaurantId !== restaurant.id,
        );
        if (branchesDoesNotBelongToRestaurant.length > 0) {
          throw new AppError(
            `Branch(s) ${branchesDoesNotBelongToRestaurant.map((branch) => branch.id).join(", ")} does not belong to the restaurant`,
            400,
          );
        }

        // 5.3.4. build member branches object
        const branchesObj: MemberBranch[] = data.branches.map(
          (branchId) =>
            new MemberBranch({
              memberId: member.id,
              branchId,
              createdAt: now,
            }),
        );
        // 5.3.5. set member branches
        await setMemberBranches(member.id, branchesObj, trx);
      }

      // 6. generate otp, create password reset record and send email to member
      // 6.1. generate otp
      const otp = generateOTP();

      // 6.2. hash otp
      const hashedOtp = hashOTP(otp);

      // 6.3. create password reset record
      await createPasswordReset(
        {
          userId: user.id,
          otpHash: hashedOtp,
          expiresAt: new Date(Date.now() + minutesToMilliseconds(10)), // 10 minutes
          createdAt: now,
        },
        trx,
      );

      // 6.4. TODO: send email to member
      console.log(`mocked email sent: ${otp}`);

      // 6.5. commit transaction
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // 7. return
    return;
  };
}

export const memberService = new MemberService();
