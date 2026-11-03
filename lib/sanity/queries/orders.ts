import { defineQuery } from "next-sanity";

/**
 * Get orders by user ID or verified phone number
 * Used on Customer Portal & orders list page
 */
export const ORDERS_BY_USER_QUERY = defineQuery(`*[
  _type == "order"
  && (userId == $userId || ($phone != "" && phone == $phone))
] | order(createdAt desc) {
  _id,
  orderNumber,
  total,
  status,
  createdAt,
  customerName,
  phone,
  address,
  orderDataJson,
  items[]{
    _key,
    quantity,
    priceAtPurchase,
    productName,
    "productRef": product._ref,
    "resolvedName": coalesce(product->name, productName),
    "resolvedImage": product->images[0].asset->url
  },
  "itemCount": count(items),
  "itemNames": items[]{ "name": coalesce(product->name, productName) }.name,
  "itemImages": items[].product->images[0].asset->url
}`);

/**
 * Get grooming bookings by user ID or verified phone number
 * Used on Customer Portal grooming tab
 */
export const GROOMING_BOOKINGS_BY_USER_QUERY = defineQuery(`*[
  _type == "groomingBooking"
  && (userId == $userId || ($phone != "" && customerPhone == $phone))
] | order(appointmentDate desc) {
  _id,
  bookingNumber,
  customerName,
  customerPhone,
  customerEmail,
  petType,
  petName,
  breedSize,
  package,
  price,
  additionalServices,
  appointmentDate,
  specialNotes,
  status,
  createdAt
}`);

/**
 * Get single order by ID with full details
 * Used on order detail page
 */
export const ORDER_BY_ID_QUERY = defineQuery(`*[
  _type == "order"
  && _id == $id
][0] {
  _id,
  orderNumber,
  userId,
  email,
  customerName,
  phone,
  orderDataJson,
  items[]{
    _key,
    quantity,
    priceAtPurchase,
    productName,
    "productRef": product._ref,
    product->{
      _id,
      name,
      "slug": slug.current,
      "image": images[0]{
        asset->{
          _id,
          url
        }
      }
    }
  },
  total,
  status,
  address{
    name,
    line1,
    line2,
    city,
    postcode,
    country
  },
  stripePaymentId,
  createdAt
}`);

/**
 * Get recent orders (for admin dashboard)
 */
export const RECENT_ORDERS_QUERY = defineQuery(`*[
  _type == "order"
] | order(createdAt desc) [0...$limit] {
  _id,
  orderNumber,
  email,
  total,
  status,
  createdAt
}`);

/**
 * Check if order exists by Stripe payment ID
 * Used for webhook idempotency check
 */
export const ORDER_BY_STRIPE_PAYMENT_ID_QUERY = defineQuery(`*[
  _type == "order"
  && stripePaymentId == $stripePaymentId
][0]{ _id }`);

