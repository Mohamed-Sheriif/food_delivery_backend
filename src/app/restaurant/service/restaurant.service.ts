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
import { userService, UserService } from "../../user/service/user.service";

export class RestaurantService {
  constructor(private readonly userService: UserService) {}
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

    // 2. start transaction
    const trx = await db.transaction();
    let user: Partial<User>;
    let restaurant: Restaurant;
    try {
      // 3. create user
      user = await this.userService.createUser(
        {
          email: data.owner.email,
          phone: data.owner.phone,
          name: data.owner.name,
          password: data.owner.password,
          systemRole: SystemRole.RESTAURANT_USER,
        },
        trx,
      );

      // 4. create restaurant
      restaurant = await this.create(user.id!, data, trx);

      // 5. commit transaction
      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }

    // 6. return restaurant
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

export const restaurantService = new RestaurantService(userService);
