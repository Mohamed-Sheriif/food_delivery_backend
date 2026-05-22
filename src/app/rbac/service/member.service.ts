import { db } from "../../../common/knex/knex";
import { minutesToMilliseconds } from "../../../common/time/time";
import { UserAlreadyExistsError } from "../../auth/errors";
import { createPasswordReset } from "../../auth/repository/password-reset-repo";
import { generateOTP, hashOTP } from "../../auth/utils";
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

    const now = new Date();
    const trx = await db.transaction();
    let user: User;
    let member: RestaurantMember;
    // 4. create user, member and assign branches if provided
    try {
      // 4.1. create user
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

      // 4.2. create member
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

      // 4.3. assign branches if provided
      if (data.branches) {
        const branchesObj: MemberBranch[] = data.branches.map(
          (branchId) =>
            new MemberBranch({
              memberId: member.id,
              branchId,
              createdAt: now,
            }),
        );
        await setMemberBranches(member.id, branchesObj, trx);
      }

      // 5. generate otp, create password reset record and send email to member
      // 5.1. generate otp
      const otp = generateOTP();

      // 5.2. hash otp
      const hashedOtp = hashOTP(otp);

      // 5.3. create password reset record
      await createPasswordReset(
        {
          userId: user.id,
          otpHash: hashedOtp,
          expiresAt: new Date(Date.now() + minutesToMilliseconds(10)), // 10 minutes
          createdAt: now,
        },
        trx,
      );

      // 5.4. TODO: send email to member

      // 5.5. commit transaction
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // 6. return
    return;
  };
}

export const memberService = new MemberService();
