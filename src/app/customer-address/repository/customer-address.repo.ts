import { db } from "../../../common/knex/knex";
import { CustomerAddress } from "../entity/customer-address.entity";

const CUSTOMER_ADDRESS_COLUMNS = [
  "id",
  "user_id",
  "label",
  "country",
  "city",
  "street",
  "building",
  "apartment_number",
  "type",
  "lat",
  "lng",
  "is_default",
  "created_at",
  "updated_at",
  "deleted_at",
];

function toEntity(row: any) {
  return new CustomerAddress({
    id: row.id,
    userId: row.user_id,
    label: row.label,
    country: row.country,
    city: row.city,
    street: row.street,
    building: row.building,
    apartmentNumber: row.apartment_number,
    type: row.type,
    lat: row.lat,
    lng: row.lng,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  });
}

export async function createCustomerAddress(
  customerAddress: Partial<CustomerAddress>,
): Promise<CustomerAddress> {
  const [row] = await db("customer_addresses")
    .insert({
      user_id: customerAddress.userId,
      label: customerAddress.label,
      country: customerAddress.country,
      city: customerAddress.city,
      street: customerAddress.street,
      building: customerAddress.building,
      apartment_number: customerAddress.apartmentNumber,
      type: customerAddress.type,
      lat: customerAddress.lat,
      lng: customerAddress.lng,
      is_default: customerAddress.isDefault,
    })
    .returning(CUSTOMER_ADDRESS_COLUMNS);

  return toEntity(row);
}

export async function findCustomerAddressById(
  id: number,
): Promise<CustomerAddress | undefined> {
  const row = await db("customer_addresses")
    .select(CUSTOMER_ADDRESS_COLUMNS)
    .where("id", id)
    .whereNull("deleted_at")
    .first();

  return row ? toEntity(row) : undefined;
}

export async function findCustomerDefaultAddressByUserId(
  userId: number,
): Promise<CustomerAddress | undefined> {
  const row = await db("customer_addresses")
    .select(CUSTOMER_ADDRESS_COLUMNS)
    .where("user_id", userId)
    .where("is_default", true)
    .whereNull("deleted_at")
    .first();

  return row ? toEntity(row) : undefined;
}

export async function findCustomerAddressesByUserId(
  userId: number,
): Promise<CustomerAddress[]> {
  const rows = await db("customer_addresses")
    .select(CUSTOMER_ADDRESS_COLUMNS)
    .where("user_id", userId)
    .whereNull("deleted_at");

  return rows.map(toEntity);
}

export async function updateCustomerAddress(
  id: number,
  customerAddress: Partial<CustomerAddress>,
): Promise<CustomerAddress | undefined> {
  const payload: Record<string, unknown> = {};

  if (customerAddress.label !== undefined)
    payload.label = customerAddress.label;
  if (customerAddress.country !== undefined)
    payload.country = customerAddress.country;
  if (customerAddress.city !== undefined) payload.city = customerAddress.city;
  if (customerAddress.street !== undefined)
    payload.street = customerAddress.street;
  if (customerAddress.building !== undefined)
    payload.building = customerAddress.building;
  if (customerAddress.apartmentNumber !== undefined) {
    payload.apartment_number = customerAddress.apartmentNumber;
  }
  if (customerAddress.type !== undefined) payload.type = customerAddress.type;
  if (customerAddress.lat !== undefined) payload.lat = customerAddress.lat;
  if (customerAddress.lng !== undefined) payload.lng = customerAddress.lng;
  if (customerAddress.isDefault !== undefined)
    payload.is_default = customerAddress.isDefault;
  if (customerAddress.updatedAt !== undefined)
    payload.updated_at = customerAddress.updatedAt;

  const [row] = await db("customer_addresses")
    .update(payload)
    .where("id", id)
    .whereNull("deleted_at")
    .returning(CUSTOMER_ADDRESS_COLUMNS);

  return row ? toEntity(row) : undefined;
}

export async function makeCustomerAddressDefault(
  userId: number,
  id: number,
): Promise<CustomerAddress | undefined> {
  return await db.transaction(async (trx) => {
    const now = new Date();

    await trx("customer_addresses")
      .update({
        is_default: false,
        updated_at: now,
      })
      .where("user_id", userId)
      .whereNull("deleted_at");

    const [row] = await trx("customer_addresses")
      .update({
        is_default: true,
        updated_at: now,
      })
      .where("id", id)
      .where("user_id", userId)
      .whereNull("deleted_at")
      .returning(CUSTOMER_ADDRESS_COLUMNS);

    return row ? toEntity(row) : undefined;
  });
}

export async function deleteCustomerAddress(
  userId: number,
  id: number,
  wasDefault: boolean,
): Promise<void> {
  await db.transaction(async (trx) => {
    const now = new Date();

    await trx("customer_addresses")
      .update({ deleted_at: now, updated_at: now })
      .where("id", id)
      .where("user_id", userId)
      .whereNull("deleted_at");

    if (!wasDefault) {
      return;
    }

    const candidate = await trx("customer_addresses")
      .select("id")
      .where("user_id", userId)
      .whereNull("deleted_at")
      .orderBy("created_at", "asc")
      .first();

    if (!candidate) {
      return;
    }

    await trx("customer_addresses")
      .update({
        is_default: false,
        updated_at: now,
      })
      .where("user_id", userId)
      .whereNull("deleted_at");

    await trx("customer_addresses")
      .update({
        is_default: true,
        updated_at: now,
      })
      .where("id", candidate.id)
      .where("user_id", userId)
      .whereNull("deleted_at");
  });
}
