import { Knex } from "knex";
import { RegisterRestaurantDTO } from "../../auth/dto/auth.dto";
import { Restaurant } from "../entity/restaurant.entity";
import { RestaurantStatus } from "../enums";
import { createRestaurant } from "../repository/restaurant.repo";

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
}

export const restaurantService = new RestaurantService();
