import { Knex } from "knex";
import { UnauthorizedError } from "../../../common/auth/errors";
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
  deleteUser,
  findUserExistsByEmailOrPhone,
} from "../../user/repository/users.repo";
import {
  CreateMemberDto,
  UpdateMemberBranchesDto,
  UpdateMemberDto,
} from "../dto/member.dto";
import { MemberBranch } from "../entity/member-branch.entity";
import { RestaurantMember } from "../entity/restaurant-member.entity";
import { RestaurantMemberStatus } from "../enums";
import {
  BranchesDoNotBelongToRestaurantError,
  BranchesNotFoundError,
  CannotCreateOwnerMemberError,
  CannotDeleteOwnerMemberError,
  MemberNotFoundError,
  OwnerHasAccessToAllBranchesError,
  RoleNotFoundError,
} from "../errors";
import {
  countBranchesByIdsAndRestaurant,
  setMemberBranches,
} from "../repository/member-branch.repo";
import { findPermissionsByRoleName } from "../repository/permission.repo";
import {
  createRestaurantMember,
  deleteRestaurantMember,
  findMembersByRestaurantId,
  findMemberWithRoleName,
  findRestaurantMemberById,
  updateMember,
} from "../repository/restaurant-member.repo";
import { findRoleByName } from "../repository/role.repo";
import { userService, UserService } from "../../user/service/user.service";

export class MemberService {
  constructor(private readonly userService: UserService) {}

  createMemberOwner = async (
    restaurantId: number,
    userId: number,
    trx: Knex = db,
  ): Promise<RestaurantMember> => {
    // 1. find role id by name
    const roleId = await findRoleByName("owner");
    if (!roleId) {
      throw new RoleNotFoundError();
    }

    // 2. create owner
    const owner = await createRestaurantMember(
      {
        restaurantId: restaurantId,
        userId,
        roleId: roleId,
        status: RestaurantMemberStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      trx,
    );

    // 3. return owner
    return owner;
  };

  createMember = async (restaurantId: number, data: CreateMemberDto) => {
    // 1. don't accept owner role creation
    if (data.role === "owner") {
      throw new CannotCreateOwnerMemberError();
    }

    // 2. find roleId by role name
    const roleId = await findRoleByName(data.role);
    if (!roleId) {
      throw new RoleNotFoundError();
    }

    // 3. find restaurant by id
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    const now = new Date();
    const trx = await db.transaction();
    let user: Partial<User>;
    let member: RestaurantMember;
    // 4. create user, member and assign branches if provided
    try {
      // 4.1. create user
      user = await this.userService.createUser(
        {
          email: data.email,
          phone: data.phone,
          name: data.name,
          systemRole: SystemRole.RESTAURANT_USER,
          password: "",
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
        // 4.3.1. remove duplicates if exists
        const uniqueBranches = [...new Set(data.branches)];

        // 4.3.2. find branches by ids
        const branches = await findBranchesByIds(uniqueBranches);
        const existingIds = branches.map((branch) => branch.id);
        const missingIds = uniqueBranches.filter(
          (id) => !existingIds.includes(id),
        );
        if (missingIds.length > 0) {
          throw new BranchesNotFoundError(missingIds);
        }

        // 4.3.3. validate branches belong to the restaurant
        const branchesDoesNotBelongToRestaurant = branches.filter(
          (branch) => Number(branch.restaurantId) !== Number(restaurant.id),
        );
        if (branchesDoesNotBelongToRestaurant.length > 0) {
          throw new BranchesDoNotBelongToRestaurantError(
            branchesDoesNotBelongToRestaurant.map((branch) => branch.id),
          );
        }

        // 4.3.4. build member branches object
        const branchesObj: MemberBranch[] = data.branches.map(
          (branchId) =>
            new MemberBranch({
              memberId: member.id,
              branchId,
              createdAt: now,
            }),
        );
        // 4.3.5. set member branches
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
      console.log(`mocked email sent: ${otp}`);

      // 5.5. commit transaction
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // 6. return
    return;
  };

  listMembers = async (restaurantId: number) => {
    // 1. find restaurant by id
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 2. find members by restaurant id
    const members = await findMembersByRestaurantId(restaurantId);

    // 3. return members
    return members;
  };

  updateMember = async (
    restaurantId: number,
    memberId: number,
    data: UpdateMemberDto,
  ) => {
    // 1. find restaurant by id
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 2. find member by id
    const member = await findRestaurantMemberById(memberId);
    if (!member) {
      throw new MemberNotFoundError();
    }

    // 3. verify member belongs to the restaurant
    if (Number(member.restaurantId) !== Number(restaurantId)) {
      throw new UnauthorizedError();
    }

    // 4. if role exist in data, find role by name
    let roleId: number | undefined;
    if (data.role) {
      roleId = await findRoleByName(data.role);
      if (!roleId) {
        throw new RoleNotFoundError();
      }
    }

    // 5. update member
    const updatedMember = await updateMember(memberId, {
      roleId: roleId ? Number(roleId) : undefined,
      status: data.status,
    });

    // 6. return updated member
    return updatedMember;
  };

  deleteMember = async (restaurantId: number, memberId: number) => {
    // 1. find restaurant by id
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 2. find member by id
    const member = await findMemberWithRoleName(memberId);
    if (!member) {
      throw new MemberNotFoundError();
    }

    // 3. verify member belongs to the restaurant
    if (Number(member.member.restaurantId) !== Number(restaurantId)) {
      throw new UnauthorizedError();
    }

    // 4. if member role is owner, throw error
    if (member.roleName === "owner") {
      throw new CannotDeleteOwnerMemberError();
    }

    // 5. delete member
    await deleteRestaurantMember(memberId);

    // 6. delete member user
    await deleteUser(member.member.userId);

    // 7. return
    return;
  };

  updateMemberBranches = async (
    restaurantId: number,
    memberId: number,
    data: UpdateMemberBranchesDto,
  ) => {
    // 1. find restaurant by id
    const restaurant = await findRestaurantById(restaurantId);
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 2. find member by id
    const member = await findMemberWithRoleName(memberId);
    if (!member) {
      throw new MemberNotFoundError();
    }

    // 3. verify member belongs to the restaurant
    if (Number(member.member.restaurantId) !== Number(restaurantId)) {
      throw new UnauthorizedError();
    }

    // 4. if roleName is owner, owner have access to all branches, reject
    if (member.roleName === "owner") {
      throw new OwnerHasAccessToAllBranchesError();
    }

    // 5. validate branches belong to the restaurant
    const branchesCountThatBelongToRestaurant =
      await countBranchesByIdsAndRestaurant(data.branches, restaurantId);
    if (
      Number(branchesCountThatBelongToRestaurant) !==
      Number(data.branches.length)
    ) {
      throw new BranchesDoNotBelongToRestaurantError(data.branches);
    }

    // 6. build member branches object
    const branchesObj: MemberBranch[] = data.branches.map(
      (branchId) =>
        new MemberBranch({
          memberId: member.member.id,
          branchId,
          createdAt: new Date(),
        }),
    );

    // 7. set member branches
    await setMemberBranches(member.member.id, branchesObj);

    // 8. return
    return;
  };

  getRolePermissions = async (roleName: string) => {
    // 1. find role by name
    const role = await findRoleByName(roleName);
    if (!role) {
      throw new RoleNotFoundError();
    }

    // 2. find role permissions by role id
    const rolePermissions = await findPermissionsByRoleName(roleName);

    // 3. return role permissions
    return {
      roleName,
      permissions: rolePermissions,
    };
  };
}

export const memberService = new MemberService(userService);
