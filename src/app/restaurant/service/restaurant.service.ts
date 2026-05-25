import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import {
  createRestaurant,
  findAllRestaurants,
  findRestaurantById,
  updateRestaurant,
  updateRestaurantStatus,
} from "../repository/restaurant.repo";
import { RestaurantNotFoundError } from "../errors";
import {
  CreateRestaurantWithOwnerDTO,
  UpdateRestauranDTO,
  UpdateRestaurantStatusDTO,
} from "../dto/restaurant.dto";
import { SystemRole } from "../../user/enums";
import {
  createUser,
  findUserExistsByEmailOrPhone,
} from "../../user/repository/users.repo";
import { UserAlreadyExistsError } from "../../auth/errors";
import { hashPassword } from "../../auth/utils";
import { db } from "../../../common/knex/knex";
import { User } from "../../user/entity/user.entity";
import {
  OnlySystemAdminAllowedError,
  OnlySystemAdminOrRestaurantOwnerAllowedError,
} from "../../../common/auth/errors";

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
      throw new OnlySystemAdminAllowedError();
    }

    // 2. check if user exists by email
    const userExists = await findUserExistsByEmailOrPhone(
      data.owner.email,
      data.owner.phone,
    );

    // 3. if exists we throw an error
    if (userExists) {
      throw new UserAlreadyExistsError();
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
      throw new RestaurantNotFoundError();
    }

    return restaurant;
  };

  update = async (
    authenticatedUser: {
      userId: number;
      role: string;
    },
    id: number,
    data: UpdateRestauranDTO,
  ): Promise<Restaurant> => {
    // 1. get restaurant by id
    const restaurant = await findRestaurantById(id);

    // 2. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant?.ownerId)
    ) {
      throw new OnlySystemAdminOrRestaurantOwnerAllowedError();
    }

    // 3. check if restaurant exists
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 4. update restaurant
    const updatedRestaurant = await updateRestaurant(id, data);

    return updatedRestaurant!;
  };

  updateStatus = async (
    authenticatedUserRole: string,
    id: number,
    data: UpdateRestaurantStatusDTO,
  ): Promise<Restaurant> => {
    // 1. get restaurant by id
    const restaurant = await findRestaurantById(id);

    // 2. check logged in user is system admin
    if (authenticatedUserRole !== SystemRole.SYSTEM_ADMIN) {
      throw new OnlySystemAdminAllowedError();
    }

    // 3. check if restaurant ex
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 3. update restaurant status
    const updatedRestaurant = await updateRestaurantStatus(id, data.status);

    return updatedRestaurant!;
  };
}

export const restaurantService = new RestaurantService();
