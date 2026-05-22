import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from "class-validator";

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
