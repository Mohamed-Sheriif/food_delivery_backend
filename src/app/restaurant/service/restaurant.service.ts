import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import {
  createRestaurant,
  findAllRestaurants,
  findRestaurantById,
} from "../repository/restaurant.repo";
import {
  RestaurantNotFoundError,
  UnauthorizedErrorOnlySystemAdmin,
} from "../errors";
import { CreateRestaurantWithOwnerDTO } from "../dto/restaurant.dto";
import { SystemRole } from "../../user/enums";
import {
  createUser,
  findUserExistsByEmailOrPhone,
} from "../../user/repository/users.repo";
import { UserAlreadyExistsError } from "../../auth/errors";
import { hashPassword } from "../../auth/utils";
import { db } from "../../../common/knex/knex";
import { User } from "../../user/entity/user.entity";

export class RestaurantService {
  create = async (
    userId: number,
    data: RegisterRestaurantDTO,
    trx: Knex,
  ): Promise<Restaurant> => {
    const now = new Date();

    const restaurant = await createRestaurant(
      new Restaurant({
        ownerId: userId,
        name: data.name,
        logoURL: data.logoURL,
        status: RestaurantStatus.PENDING,
        statusUpdatedAt: now,
        primaryCountry: data.primaryCountry,
        createdAt: now,
        updatedAt: now,
      }),
      trx,
    );

    return restaurant;
  };

  createWithOwner = async (
    authenticatedUserRole: string,
    data: CreateRestaurantWithOwnerDTO,
  ) => {
    // 1. check authenticated user is system admin
    if (authenticatedUserRole !== SystemRole.SYSTEM_ADMIN) {
      throw UnauthorizedErrorOnlySystemAdmin;
    }

    // 2. check if user exists by email
    const userExists = await findUserExistsByEmailOrPhone(
      data.owner.email,
      data.owner.phone,
    );

    // 3. if exists we throw an error
    if (userExists) {
      throw UserAlreadyExistsError;
    }

    // 4. hashPassword
    const hashedPassword = await hashPassword(data.owner.password);

    // 5. start transaction
    const now = new Date();
    const trx = await db.transaction();
    let user: User;
    let restaurant: Restaurant;
    try {
      // 6. create user
      user = await createUser(
        {
          email: data.owner.email,
          phone: data.owner.phone,
          name: data.owner.name,
          passwordHash: hashedPassword,
          systemRole: SystemRole.RESTAURANT_USER,
          createdAt: now,
          updatedAt: now,
        },
        trx,
      );

      // 7. create restaurant
      restaurant = await this.create(user.id, data, trx);

      // 8. commit transaction
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // 8. return restaurant
    return {
      message: "Successfully created restaurant with owner",
      restaurant,
      owner: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        systemRole: user.systemRole,
        createdAt: user.createdAt,
      },
    };
  };

  findAll = async (): Promise<Restaurant[]> => {
    const restaurants = await findAllRestaurants();

    return restaurants;
  };

  findById = async (id: number): Promise<Restaurant> => {
    const restaurant = await findRestaurantById(id);

    if (!restaurant) {
      throw RestaurantNotFoundError;
    }

    return restaurant;
  };
}

export const restaurantService = new RestaurantService();
