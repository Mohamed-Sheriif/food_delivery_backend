import { Currency } from "../enums";

export class NearbyBranch {
  id: number;
  restaurantId: number;
  addressText: string;
  label: string;
  lat: number;
  lng: number;
  isActive: boolean;
  acceptOrders: boolean;
  currency: Currency;
  restaurantName: string;
  logoUrl: string;

  constructor(data: Partial<NearbyBranch>) {
    this.id = data.id!;
    this.restaurantId = data.restaurantId!;
    this.addressText = data.addressText!;
    this.label = data.label!;
    this.lat = data.lat!;
    this.lng = data.lng!;
    this.isActive = data.isActive!;
    this.acceptOrders = data.acceptOrders!;
    this.currency = data.currency!;
    this.restaurantName = data.restaurantName!;
    this.logoUrl = data.logoUrl!;
  }
}
