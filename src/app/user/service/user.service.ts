import { Knex } from "knex";
import { UserAlreadyExistsError } from "../../auth/errors";
import { hashPassword } from "../../auth/utils";
import { User } from "../entity/user.entity";
import { SystemRole } from "../enums";
import { UserNotFoundError } from "../errors";
import {
  createUser,
  findUserById,
  findUserExistsByEmailOrPhone,
  updateUser,
} from "../repository/users.repo";
import { db } from "../../../lib/knex/knex";

export interface CreateUserDto {
  email: string;
  phone: string;
  name: string;
  password: string;
  systemRole: SystemRole;
}
export class UserService {
  createUser = async (
    user: CreateUserDto,
    trx: Knex = db,
  ): Promise<Partial<User>> => {
    // 1. check if user already exists
    const existingUser = await findUserExistsByEmailOrPhone(
      user.email,
      user.phone,
    );
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    // 2. hash password
    const hashedPassword = await hashPassword(user.password);

    // 3. create user
    const now = new Date();
    const newUser = await createUser(
      {
        email: user.email,
        phone: user.phone,
        name: user.name,
        passwordHash: hashedPassword,
        systemRole: user.systemRole,
        createdAt: now,
        updatedAt: now,
      },
      trx,
    );

    // 4. return user
    return {
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      name: newUser.name,
      systemRole: newUser.systemRole,
    };
  };

  getByUserId = async (userId: number): Promise<Partial<User>> => {
    const user = await findUserById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      systemRole: user.systemRole,
    };
  };

  updateUser = async (
    userId: number,
    user: { phone?: string; name?: string },
  ): Promise<Partial<User>> => {
    const updatedUser = await updateUser(userId, user);

    if (!updatedUser) {
      throw new UserNotFoundError();
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      phone: updatedUser.phone,
      name: updatedUser.name,
      systemRole: updatedUser.systemRole,
    };
  };
}

export const userService = new UserService();
