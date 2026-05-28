import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { RestaurantMemberStatus } from "../enums";

export class CreateMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsArray()
  @IsOptional()
  @IsNumber({}, { each: true, message: "Each branch must be a number" })
  branches?: number[];
}

export class CreateMemberParams {
  @IsNumberString()
  @IsNotEmpty()
  restaurantId!: number;
}

export class UpdateMemberParams {
  @IsNumberString()
  @IsNotEmpty()
  restaurantId!: number;

  @IsNumberString()
  @IsNotEmpty()
  memberId!: number;
}

export class GetRolePermissionsParams {
  @IsString()
  @IsNotEmpty()
  roleName!: string;
}

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsEnum(RestaurantMemberStatus)
  status?: RestaurantMemberStatus;
}

export class UpdateMemberBranchesDto {
  @IsArray()
  @IsNumber({}, { each: true, message: "Each branch must be a number" })
  @IsNotEmpty()
  branches!: number[];
}
