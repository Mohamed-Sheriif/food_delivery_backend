import { IsOptional, IsString } from "class-validator";

export class UpdateUserDTO {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  name?: string;
}
