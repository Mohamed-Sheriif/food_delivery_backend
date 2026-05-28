import {
  OnlySystemAdminAllowedError,
  OnlySystemAdminOrRestaurantOwnerAllowedError,
} from "../../../common/auth/errors";
import { RestaurantNotFoundError } from "../../restaurant/errors";
import {
  restaurantService,
  RestaurantService,
} from "../../restaurant/service/restaurant.service";
import { SystemRole } from "../../user/enums";
import {
  CreateBranchDTO,
  UpdateBranchDTO,
  UpdateBranchStatusDTO,
} from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";
import { BranchNotFoundError } from "../errors";
import {
  createBranch,
  findBranchById,
  findNearbyBranches,
  updateBranch,
  updateBranchStatus,
} from "../repository/branch.repo";

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
      throw new OnlySystemAdminOrRestaurantOwnerAllowedError();
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

  updateBranch = async (
    authenticatedUser: {
      userId: number;
      role: string;
    },
    id: number,
    data: UpdateBranchDTO,
  ): Promise<Branch> => {
    // 1. get branch by id
    const branch = await findBranchById(id);

    // 2. throw error if branch not found
    if (!branch) {
      throw new BranchNotFoundError();
    }

    // 4. get restaurant by id
    const restaurant = await this.restaurantService.findById(
      branch.restaurantId,
    );

    // 4. throw error if restaurant not found
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 5. check logged in user is system admin or the owner of the restaurant
    if (
      authenticatedUser.role !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUser.userId !== Number(restaurant?.ownerId)
    ) {
      throw new OnlySystemAdminOrRestaurantOwnerAllowedError();
    }

    // 6. update branch
    const updatedBranch = await updateBranch(id, data);

    // 7. return updated branch
    return updatedBranch!;
  };

  updateBranchStatus = async (
    authenticatedUserRole: string,
    id: number,
    data: UpdateBranchStatusDTO,
  ): Promise<Branch> => {
    // 1. get branch by id
    const branch = await findBranchById(id);

    // 2. throw error if branch not found
    if (!branch) {
      throw new BranchNotFoundError();
    }

    // 3. get restaurant by id
    const restaurant = await this.restaurantService.findById(
      branch.restaurantId,
    );

    // 4. throw error if restaurant not found
    if (!restaurant) {
      throw new RestaurantNotFoundError();
    }

    // 5. check logged in user is system admin
    if (
      authenticatedUserRole !== SystemRole.SYSTEM_ADMIN &&
      authenticatedUserRole !== SystemRole.RESTAURANT_USER
    ) {
      throw new OnlySystemAdminAllowedError();
    }

    // 6. update branch status
    const updatedBranch = await updateBranchStatus(id, data);

    // 7. return updated branch
    return updatedBranch!;
  };
}

export const branchService = new BranchService(restaurantService);
