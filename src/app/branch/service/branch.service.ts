import { UnauthorizedErrorOnlySystemAdminOrRestaurantOwner } from "../../../common/auth/errors";
import {
  restaurantService,
  RestaurantService,
} from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import { CreateBranchDTO } from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";
import { createBranch, findNearbyBranches } from "../repository/branch.repo";

export class BranchService {
  constructor(private readonly restaurantService: RestaurantService) {}
  createBranch = async (
    authenticatedUser: {
      userId: number;
      role: string;
    },
    data: CreateBranchDTO,
    restaurantId: number,
  ): Promise<Branch> => {
    // 1. get restaurant by id
    const restaurant = await this.restaurantService.findById(restaurantId);

    // 2. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant?.ownerId)
    ) {
      throw UnauthorizedErrorOnlySystemAdminOrRestaurantOwner;
    }

    // 3. create branch
    const now = new Date();
    const newBranch = await createBranch({
      restaurantId,
      countryCode: data.countryCode,
      addressText: data.addressText,
      label: data.label,
      lat: data.lat,
      lng: data.lng,
      isActive: false,
      opensAt: data.opensAt,
      closesAt: data.closesAt,
      acceptOrders: true,
      deliveryRadius: data.deliveryRadius,
      currency: data.currency,
      commission: 0,
      createdAt: now,
      updatedAt: now,
    });

    // 4. return new branch
    return newBranch;
  };

  findNearbyBranches = async (lat: number, lng: number): Promise<Branch[]> => {
    const branches = await findNearbyBranches(lat, lng);

    return branches;
  };
}

export const branchService = new BranchService(restaurantService);
