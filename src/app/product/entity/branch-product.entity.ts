export class BranchProduct {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  restaurantId: number;
  categoryId: number;
  categoryName: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  createdAt: Date;

  constructor(data: Partial<BranchProduct>) {
    this.id = data.id!;
    this.name = data.name!;
    this.description = data.description!;
    this.imageUrl = data.imageUrl!;
    this.restaurantId = data.restaurantId!;
    this.categoryId = data.categoryId!;
    this.categoryName = data.categoryName!;
    this.price = data.price!;
    this.stock = data.stock!;
    this.isAvailable = data.isAvailable!;
    this.createdAt = data.createdAt!;
  }
}
