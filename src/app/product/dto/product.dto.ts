import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class CreateProductDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  imageUrl!: string;

  @IsString()
  @IsNotEmpty()
  categoryName!: string;
}

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
