import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(11)
  phone?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;
}
