import { SystemRole } from "../../user/enums";
import {
  findUserByEmail,
  findUserExistsByEmailOrPhone,
  createUser,
  updateUserPassword,
  findUserById,
} from "../../user/repository/users.repo";
import { LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import { minutesToMilliseconds } from "../../../common/time/time";
import {
  UserAlreadyExistsError,
  CannotSignupAsSystemAdmin,
  IncorrectCredentialsError,
  InvalidOTPError,
  InvalidTokenError,
  RestaurantDataRequiredError,
} from "../errors";
import {
  createPasswordReset,
  findLatestPasswordResetByUserId,
  updatePasswordResetConsumedAt,
} from "../repository/password-reset-repo";
import {
  hashPassword,
  createAccessToken,
  createRefreshToken,
  comparePassword,
  generateOTP,
  hashOTP,
  verifyRefreshToken,
  JwtPayload,
} from "../utils";
import {
  RestaurantService,
  restaurantService,
} from "../../restaurant/service/restaurant.service";
import { Restaurant } from "../../restaurant/entity/restaurant.entity";
import { User } from "../../user/entity/user.entity";
import { db } from "../../../common/knex/knex";
import {
  activateMemberByUserId,
  createRestaurantMember,
  findRestaurantMemberWithRole,
} from "../../rbac/repository/restaurant-member.repo";
import { findBranchIdsByMemberId } from "../../rbac/repository/member-branch.repo";
import { RestaurantMember } from "../../rbac/entity/restaurant-member.entity";
import { findRoleByName } from "../../rbac/repository/role.repo";
import { RoleNotFoundError } from "../../rbac/errors";
import { RestaurantMemberStatus } from "../../rbac/enums";

export class AuthService {
  constructor(private readonly restaurantService: RestaurantService) {}

  register = async (data: RegisterDTO) => {
    if (data.role == SystemRole.SYSTEM_ADMIN) {
      throw CannotSignupAsSystemAdmin;
    }
    // 1. check if user exists by email
    const existing = await findUserExistsByEmailOrPhone(data.email, data.phone);

    // 2. if exists we throw an error
    if (existing) {
      throw UserAlreadyExistsError;
    }
    // 3. hashPassword
    const hashedPassword = await hashPassword(data.password);

    // 4. start transaction
    const now = new Date();
    const trx = await db.transaction();
    let user: User;
    let restaurant: Restaurant | undefined;
    let restaurantMember: RestaurantMember | undefined;
    try {
      // 5. create user
      user = await createUser(
        {
          email: data.email,
          phone: data.phone,
          name: data.name,
          passwordHash: hashedPassword,
          systemRole: data.role,
          createdAt: now,
          updatedAt: now,
        },
        trx,
      );

      // 6. check if user is restaurant user, then call restaurant service to create restaurant and create restaurant member
      if (data.role === SystemRole.RESTAURANT_USER) {
        if (data.restaurant === undefined) {
          throw RestaurantDataRequiredError;
        }

        restaurant = await this.restaurantService.create(
          user.id,
          data.restaurant,
          trx,
        );

        // 6.1. find role id by name
        const roleId = await findRoleByName("owner");
        if (!roleId) {
          throw RoleNotFoundError;
        }

        // 6.2. create restaurant member
        restaurantMember = await createRestaurantMember(
          {
            userId: user.id,
            restaurantId: restaurant.id,
            roleId: roleId,
            status: RestaurantMemberStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
          },
          trx,
        );
      }

      // 7. commit transaction
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // 8. prepare the payload
    const payload: JwtPayload = {
      userId: user.id,
      role: data.role,
      email: user.email,
    };
    if (restaurantMember) {
      payload.restaurantId = restaurantMember.restaurantId;
      payload.restaurantRole = "owner";
      payload.branchIds = [];
    }

    // 9. create access token , refresh token
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // 10. return tokens and user data
    return {
      message: "Successfully registered user",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        createdAt: user.createdAt,
      },
      restaurant,
    };
  };

  login = async (data: LoginDTO) => {
    // 1. find user by email
    const user = await findUserByEmail(data.email);

    // 2. if not found throw error
    if (!user) {
      throw IncorrectCredentialsError;
    }

    // 3. compare password
    const isMatch = await comparePassword(data.password, user.passwordHash);

    // 4. if not match throw error
    if (!isMatch) {
      throw IncorrectCredentialsError;
    }

    // 5. prepare the payload
    // 5.1. find restaurant members by user id if user is restaurant user
    let restaurantMemberInfo;
    if (user.systemRole === SystemRole.RESTAURANT_USER) {
      const restaurantMember = await findRestaurantMemberWithRole(user.id);
      if (restaurantMember) {
        restaurantMemberInfo = {
          restaurantId: restaurantMember.member.restaurantId,
          restaurantRole: restaurantMember.roleName,
          branchIds: await findBranchIdsByMemberId(restaurantMember.member.id),
        };
      }
    }

    // 5.2. build the payload
    const payload = {
      userId: user.id,
      role: user.systemRole,
      email: user.email,
      ...restaurantMemberInfo,
    };

    // 6. create access token , refresh token
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // 7. return tokens and user data
    return {
      message: "Successfully logged in user",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        createdAt: user.createdAt,
      },
    };
  };

  forgetPassword = async (email: string) => {
    // 1. find user by email
    const user = await findUserByEmail(email);

    // 2. if not found return silently, we don't want to reveal that the email is not registered in our system
    if (!user) {
      return;
    }

    // 3. generate otp
    const otp = generateOTP();

    // 4. hash otp
    const hashedOtp = hashOTP(otp);

    // 5. insert otp
    await createPasswordReset({
      userId: user.id,
      otpHash: hashedOtp,
      expiresAt: new Date(Date.now() + minutesToMilliseconds(10)),
      createdAt: new Date(),
    });

    // 6.  TODO:send otp to user email
    console.log(`mocked email sent: ${otp}`);
  };

  resetPassword = async (data: ResetPasswordDTO) => {
    // 1. find user by email
    const user = await findUserByEmail(data.email);

    // 2. if not found throw error
    if (!user) {
      throw InvalidOTPError;
    }

    // 3. find otp by user id
    const passwordReset = await findLatestPasswordResetByUserId(user.id);

    // 4. if otp not valid throw error
    if (!passwordReset) {
      throw InvalidOTPError;
    }

    // 5. verify otp
    const otpHash = hashOTP(data.otp);
    if (otpHash !== passwordReset.otpHash || passwordReset.isExpired()) {
      throw InvalidOTPError;
    }

    // 6. hash new password and update
    const newHashedPassword = await hashPassword(data.newPassword);
    await updateUserPassword(user.id, newHashedPassword);

    // 7. update reset password consumedAt
    await updatePasswordResetConsumedAt(passwordReset.id);

    // 8. return user
    return user;
  };

  refreshToken = async (refreshToken: string) => {
    // 1. verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // 2. find user by user id
    const user = await findUserById(payload.userId);

    // 3. if not found throw error
    if (!user) {
      throw InvalidTokenError;
    }

    // 4. build the new payload
    const newPayload = {
      userId: user.id,
      role: user.systemRole,
      email: user.email,
    };

    // 5. create new access token and refresh token
    const newAccessToken = createAccessToken(newPayload);
    const newRefreshToken = createRefreshToken(newPayload);

    // 5. return new access token and refresh token
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        createdAt: user.createdAt,
      },
    };
  };

  acceptInvite = async (data: ResetPasswordDTO) => {
    // 1. find user by email
    // 2. find password reset by user id
    // 3. verify otp
    // 4. update password
    const user = await this.resetPassword(data);

    // 5. activate user
    await activateMemberByUserId(user.id);
  };
}

export const authService = new AuthService(restaurantService);
