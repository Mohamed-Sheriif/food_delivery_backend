import { db } from "../../../common/knex/knex";
import { UpdateBranchStatusDTO } from "../dto/branch.dto";
import { Branch } from "../entity/branch.entity";

const BRANCH_COLUMNS = [
  "id",
  "restaurant_id",
  "country_code",
  "address_text",
  "label",
  "lat",
  "lng",
  "is_active",
  "opens_at",
  "closes_at",
  "accept_orders",
  "delivery_radius",
  "currency",
  "commission",
  "created_at",
  "updated_at",
  "deleted_at",
];

function toEntity(row: any) {
  return new Branch({
    id: row.id,
    restaurantId: row.restaurant_id,
    countryCode: row.country_code,
    addressText: row.address_text,
    label: row.label,
    lat: row.lat,
    lng: row.lng,
    isActive: row.is_active,
    opensAt: row.opens_at,
    closesAt: row.closes_at,
    acceptOrders: row.accept_orders,
    deliveryRadius: row.delivery_radius,
    currency: row.currency,
    commission: row.commission,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  });
}

export async function createBranch(branch: Partial<Branch>): Promise<Branch> {
  const [row] = await db("restaurants_branches")
    .insert({
      restaurant_id: branch.restaurantId,
      country_code: branch.countryCode,
      address_text: branch.addressText,
      label: branch.label,
      lat: branch.lat,
      lng: branch.lng,
      is_active: branch.isActive,
      opens_at: branch.opensAt,
      closes_at: branch.closesAt,
      accept_orders: branch.acceptOrders,
      delivery_radius: branch.deliveryRadius,
      currency: branch.currency,
      commission: branch.commission,
      created_at: branch.createdAt,
      updated_at: branch.updatedAt,
    })
    .returning(BRANCH_COLUMNS);

  return toEntity(row);
}

export async function findNearbyBranches(
  lat: number,
  lng: number,
): Promise<Branch[]> {
  const result = await db.raw(
    `
      SELECT
      b.id,
      b.restaurant_id,
      b.address_text,
      b.label,
      b.lat,
      b.lng,
      b.is_active,
      b.accept_orders,
      b.currency,
      r.name,
      r.logo_url
      FROM restaurants_branches b JOIN restaurants r ON b.restaurant_id = r.id
      WHERE b.is_active = true AND r.status = 'active'
      AND ST_DWithin(b.location, ST_MakePoint(? , ?), b.delivery_radius*1000)
    `,
    [lng, lat],
  );

  return result.rows;
}

export async function findBranchById(id: number): Promise<Branch | undefined> {
  const row = await db("restaurants_branches")
    .select(BRANCH_COLUMNS)
    .where("id", id)
    .whereNull("deleted_at")
    .first();

  return row ? toEntity(row) : undefined;
}

export async function updateBranch(
  id: number,
  branch: Partial<Branch>,
): Promise<Branch | undefined> {
  const payload: Record<string, unknown> = {};

  if (branch.countryCode !== undefined)
    payload.country_code = branch.countryCode;
  if (branch.addressText !== undefined)
    payload.address_text = branch.addressText;
  if (branch.label !== undefined) payload.label = branch.label;
  if (branch.lat !== undefined) payload.lat = branch.lat;
  if (branch.lng !== undefined) payload.lng = branch.lng;
  if (branch.isActive !== undefined) payload.is_active = branch.isActive;
  if (branch.opensAt !== undefined) payload.opens_at = branch.opensAt;
  if (branch.closesAt !== undefined) payload.closes_at = branch.closesAt;
  if (branch.acceptOrders !== undefined)
    payload.accept_orders = branch.acceptOrders;
  if (branch.deliveryRadius !== undefined)
    payload.delivery_radius = branch.deliveryRadius;
  if (branch.currency !== undefined) payload.currency = branch.currency;

  if (Object.keys(payload).length === 0) {
    return findBranchById(id);
  }

  payload.updated_at = new Date();

  const [row] = await db("restaurants_branches")
    .where("id", id)
    .update(payload)
    .returning(BRANCH_COLUMNS);

  return row ? toEntity(row) : undefined;
}

export async function updateBranchStatus(
  id: number,
  data: UpdateBranchStatusDTO,
): Promise<Branch | undefined> {
  const payload: Record<string, unknown> = {};

  if (data.isActive !== undefined) payload.is_active = data.isActive;
  if (data.commission !== undefined) payload.commission = data.commission;

  if (Object.keys(payload).length === 0) {
    return findBranchById(id);
  }

  payload.updated_at = new Date();

  const [row] = await db("restaurants_branches")
    .where("id", id)
    .update(payload)
    .returning(BRANCH_COLUMNS);

  return row ? toEntity(row) : undefined;
}
