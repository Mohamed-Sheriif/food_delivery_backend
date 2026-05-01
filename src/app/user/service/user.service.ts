import { User } from "../entity/user.entity";
import { UserNotFoundError } from "../errors";
import { findUserById } from "../repository/users.repo";

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
}

export const userService = new UserService();
