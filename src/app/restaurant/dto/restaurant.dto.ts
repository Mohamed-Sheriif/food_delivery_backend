import { Type } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsStrongPassword,
  MaxLength,
  MinLength,
  ValidateNested,
} from "class-validator";

export class CreateRestaurantWithOwnerDTO {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  logoURL!: string;

  @IsString()
  @IsNotEmpty()
  primaryCountry!: string;

  @ValidateNested()
  @Type(() => RestaurantOwnerDTO)
  owner!: RestaurantOwnerDTO;
}

export class RestaurantOwnerDTO {
  @IsEmail()
  email!: string;

  @MinLength(10)
  @MaxLength(11)
  phone!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password is not strong enough. It must contain at least 8 characters, one uppercase letter, one lowercase letter, one number.",
    },
  )
  password!: string;
}

export class RestaurantParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  id!: string;
}
