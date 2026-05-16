export class ProductCategory {
  id: number;
  name: string;
  restaurantId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(data: Partial<ProductCategory>) {
    this.id = data.id!;
    this.name = data.name!;
    this.restaurantId = data.restaurantId!;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();
    this.deletedAt = data.deletedAt ?? null;
  }
}