export class ProductBranchDetails {
  id: number;
  productId: number;
  branchId: number;
  price: number;
  stock: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<ProductBranchDetails>) {
    this.id = data.id!;
    this.productId = data.productId!;
    this.branchId = data.branchId!;
    this.price = data.price!;
    this.stock = data.stock!;
    this.isAvailable = data.isAvailable!;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
  }
}
