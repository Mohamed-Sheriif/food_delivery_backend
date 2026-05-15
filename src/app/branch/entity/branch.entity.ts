import { Currency } from "../enums";

export class Branch {
  id: number;
  restaurantId: number;
  countryCode: string;
  addressText: string;
  label: string;
  lat: number;
  lng: number;
  isActive: boolean;
  opensAt: string; // "HH:MM:SS"
  closesAt: string; // "HH:MM:SS"
  acceptOrders: boolean;
  deliveryRadius: number; // in kilometers
  currency: Currency;
  commission: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(branch: Partial<Branch>) {
    this.id = branch.id!;
    this.restaurantId = branch.restaurantId!;
    this.countryCode = branch.countryCode!;
    this.addressText = branch.addressText!;
    this.label = branch.label!;
    this.lat = branch.lat!;
    this.lng = branch.lng!;
    this.isActive = branch.isActive!;
    this.opensAt = branch.opensAt!;
    this.closesAt = branch.closesAt!;
    this.acceptOrders = branch.acceptOrders!;
    this.deliveryRadius = branch.deliveryRadius ?? 0;
    this.currency = branch.currency!;
    this.commission = branch.commission ?? 0;
    this.createdAt = branch.createdAt ?? new Date();
    this.updatedAt = branch.updatedAt ?? new Date();
    this.deletedAt = branch.deletedAt ?? null;
  }
}
