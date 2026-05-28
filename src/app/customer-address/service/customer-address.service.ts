import {
  CreateCustomerAddressDTO,
  UpdateCustomerAddressDTO,
} from "../dto/customer-address.dto";
import { CustomerAddress } from "../entity/customer-address.entity";
import {
  CustomerAddressForbiddenError,
  CustomerAddressNotFoundError,
} from "../errors";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  findCustomerAddressById,
  findCustomerAddressesByUserId,
  findCustomerDefaultAddressByUserId,
  makeCustomerAddressDefault,
  updateCustomerAddress,
} from "../repository/customer-address.repo";

export class CustomerAddressService {
  create = async (
    userId: number,
    data: CreateCustomerAddressDTO,
  ): Promise<CustomerAddress> => {
    const defaultAddress = await findCustomerDefaultAddressByUserId(userId);

    return await createCustomerAddress({
      userId,
      label: data.label,
      country: data.country,
      city: data.city,
      street: data.street,
      building: data.building ?? null,
      apartmentNumber: data.apartmentNumber ?? null,
      type: data.type,
      lat: data.lat,
      lng: data.lng,
      // first address becomes default
      isDefault: !defaultAddress,
    });
  };

  listByUserId = async (userId: number): Promise<CustomerAddress[]> => {
    return await findCustomerAddressesByUserId(userId);
  };

  getById = async (userId: number, id: number): Promise<CustomerAddress> => {
    const address = await findCustomerAddressById(id);

    if (!address) {
      throw new CustomerAddressNotFoundError();
    }

    if (Number(address.userId) != userId) {
      throw new CustomerAddressForbiddenError();
    }

    return address;
  };

  update = async (
    userId: number,
    id: number,
    data: UpdateCustomerAddressDTO,
  ): Promise<CustomerAddress> => {
    await this.getById(userId, id);

    const updatedAddress = await updateCustomerAddress(id, {
      label: data.label,
      country: data.country,
      city: data.city,
      street: data.street,
      building: data.building,
      apartmentNumber: data.apartmentNumber,
      type: data.type,
      lat: data.lat,
      lng: data.lng,
      updatedAt: new Date(),
    });

    if (!updatedAddress) {
      throw new CustomerAddressNotFoundError();
    }

    return updatedAddress;
  };

  makeDefault = async (
    userId: number,
    id: number,
  ): Promise<CustomerAddress> => {
    await this.getById(userId, id);

    const address = await makeCustomerAddressDefault(userId, id);

    if (!address) {
      throw new CustomerAddressNotFoundError();
    }

    return address;
  };

  delete = async (userId: number, id: number): Promise<void> => {
    const address = await this.getById(userId, id);
    await deleteCustomerAddress(userId, id, address.isDefault);
  };
}

export const customerAddressService = new CustomerAddressService();
