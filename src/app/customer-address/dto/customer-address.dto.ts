import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";
import { CustomerAddressType } from "../enums";

export class CreateCustomerAddressDTO {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsOptional()
  building!: string | null;

  @IsString()
  @IsOptional()
  apartmentNumber!: string | null;

  @IsEnum(CustomerAddressType)
  @IsNotEmpty()
  type!: CustomerAddressType;

  @IsNumber()
  @IsNotEmpty()
  lat!: number;

  @IsNumber()
  @IsNotEmpty()
  lng!: number;
}

export class UpdateCustomerAddressDTO {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  building?: string | null;

  @IsString()
  @IsOptional()
  apartmentNumber?: string | null;

  @IsEnum(CustomerAddressType)
  @IsOptional()
  type?: CustomerAddressType;

  @IsNumber()
  @IsOptional()
  lat?: number;

  @IsNumber()
  @IsOptional()
  lng?: number;
}

export class CustomerAddressParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  id!: string;
}
