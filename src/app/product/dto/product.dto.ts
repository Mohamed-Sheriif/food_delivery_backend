import { PartialType } from "@nestjs/mapped-types";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

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

export class UpdateProductDTO extends PartialType(CreateProductDTO) {
  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsInt()
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateProductQueryDTO {
  @IsOptional()
  @IsNumberString()
  branchId?: string;
}
