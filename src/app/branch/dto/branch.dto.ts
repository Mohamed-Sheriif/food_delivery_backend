import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { Currency } from "../enums";
import { PartialType } from "@nestjs/mapped-types";

export class CreateBranchDTO {
  @IsString()
  @IsNotEmpty()
  countryCode!: string;

  @IsString()
  @IsNotEmpty()
  addressText!: string;

  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsNumber()
  @IsNotEmpty()
  lat!: number;

  @IsNumber()
  @IsNotEmpty()
  lng!: number;

  @IsString()
  @IsNotEmpty()
  opensAt!: string;

  @IsString()
  @IsNotEmpty()
  closesAt!: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptOrders!: boolean;

  @IsInt()
  @IsNotEmpty()
  deliveryRadius!: number;

  @IsEnum(Currency)
  @IsNotEmpty()
  currency!: Currency;
}

export class BranchParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  restaurantId!: string;
}

export class UpdateBranchParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  id!: string;
}

export class FindNearbyBranchesDTO {
  @IsNumberString()
  @IsNotEmpty()
  lat!: string;

  @IsNumberString()
  @IsNotEmpty()
  lng!: string;
}

export class UpdateBranchDTO extends PartialType(CreateBranchDTO) {}

export class UpdateBranchStatusDTO {
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;

  @IsInt()
  @IsOptional()
  commission?: number;
}
