import { IsNotEmpty, IsNumberString } from "class-validator";

export class BranchProductsParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  branchId!: string;
}

export class RestaurantProductsParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  restaurantId!: string;
}

export class ProductParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  id!: string;
}
