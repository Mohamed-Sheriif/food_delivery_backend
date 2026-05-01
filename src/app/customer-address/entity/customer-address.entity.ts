import { CustomerAddressType } from "../enums";

export class CustomerAddress {
  id: number;
  userId: number;
  label: string;
  country: string;
  city: string;
  street: string;
  building: string | null;
  apartmentNumber: string | null;
  type: CustomerAddressType;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  constructor(customerAddress: Partial<CustomerAddress>) {
    this.id = customerAddress.id!;
    this.userId = customerAddress.userId!;
    this.label = customerAddress.label!;
    this.country = customerAddress.country!;
    this.city = customerAddress.city!;
    this.street = customerAddress.street!;
    this.building = customerAddress.building ?? null;
    this.apartmentNumber = customerAddress.apartmentNumber ?? null;
    this.type = customerAddress.type!;
    this.lat = customerAddress.lat!;
    this.lng = customerAddress.lng!;
    this.isDefault = customerAddress.isDefault!;
    this.createdAt = customerAddress.createdAt ?? new Date();
    this.updatedAt = customerAddress.updatedAt ?? new Date();
    this.deletedAt = customerAddress.deletedAt ?? null;
  }
}
