import { SystemRole } from "../../user/enums";
import {
  findUserByEmail,
  findUserExistsByEmailOrPhone,
  createUser,
  updateUserPassword,
  findUserById,
} from "../../user/repository/users.repo";
import { LoginDTO, RegisterDTO, ResetPasswordDTO } from "../dto/auth.dto";
import {
  UserAlreadyExistsError,
  CannotSignupAsSystemAdmin,
  IncorrectCredentialsError,
  InvalidOTPError,
  InvalidTokenError,
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
} from "../utils";

export class AuthService {
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

    // 4. create user
    const now = new Date();
    const user = await createUser({
      email: data.email,
      phone: data.phone,
      name: data.name,
      passwordHash: hashedPassword,
      systemRole: data.role,
      createdAt: now,
      updatedAt: now,
    });

    // 5. create access token , refresh token
    const payload = { userId: user.id, role: data.role, email: user.email };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // 6. return tokens and user data
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

    // 5. create access token , refresh token
    const payload = {
      userId: user.id,
      role: user.systemRole,
      email: user.email,
    };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // 6. return tokens and user data
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
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
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
}

export const authService = new AuthService();
