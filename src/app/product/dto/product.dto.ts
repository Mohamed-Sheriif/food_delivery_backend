import { IsNotEmpty, IsNumberString } from "class-validator";

export class BranchProductsParamsDTO {
  @IsNumberString()
  @IsNotEmpty()
  branchId!: string;
}
