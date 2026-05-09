import { db } from "../../../common/knex/knex";
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
