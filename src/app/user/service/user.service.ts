import { User } from "../entity/user.entity";
import { UserNotFoundError } from "../errors";
import { findUserById, updateUser } from "../repository/users.repo";

export class UserService {
  getByUserId = async (userId: number): Promise<Partial<User>> => {
    const user = await findUserById(userId);

    if (!user) {
      throw UserNotFoundError;
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
      throw UserNotFoundError;
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
