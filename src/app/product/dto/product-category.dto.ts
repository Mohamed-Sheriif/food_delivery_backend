import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class CreateProductCategoryDTO {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name!: string;
}

export class ProductCategoryParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  restaurantId!: string;
}