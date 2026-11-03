import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import {
  ORDERS_BY_USER_QUERY,
  GROOMING_BOOKINGS_BY_USER_QUERY,
} from "@/lib/sanity/queries/orders";
import { odoo } from "@/lib/odoo/client";
import {
  CustomerPortalClient,
  type PortalGroomingAppointment,
} from "@/components/portal/CustomerPortalClient";

export const metadata = {
  title: "Customer Portal | Stephan's Pet Store",
  description:
    "Manage your orders, in-store POS receipts, pet grooming appointments, wish lists & delivery address",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/orders");
  }

  const userId = session.user.id || "";
  const isGuest = Boolean(session.user.isGuest);
  const odooPartnerId = session.user.odooPartnerId;
  const userPhone = session.user.phone || "";
  const userName = session.user.name || "Valued Customer";
  const rawEmail = session.user.email || "";
  const cleanEmail = rawEmail.endsWith("@whatsapp.stephanspetstore.co.tz")
    ? ""
    : rawEmail;

  // Safe timeout helper to protect Cloudflare Worker resource limits
  const withTimeout = <T,>(promise: Promise<T>, ms: number, fallback: T): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ]);

  const emptyOdooResult: [
    Awaited<ReturnType<typeof odoo.getCustomerPosOrders>>,
    Awaited<ReturnType<typeof odoo.getCustomerGroomingAppointments>>
  ] = [[], []];

  const odooPromise =
    !isGuest && (odooPartnerId || userPhone)
      ? odoo
          .resolveCustomerPartnerIds(odooPartnerId, userPhone)
          .then((partnerIds): Promise<typeof emptyOdooResult> =>
            Promise.all([
              odoo.getCustomerPosOrders(odooPartnerId, userPhone, partnerIds),
              odoo.getCustomerGroomingAppointments(
                odooPartnerId,
                userPhone,
                partnerIds
              ),
            ])
          )
          .catch(() => emptyOdooResult)
      : Promise.resolve(emptyOdooResult);

  const [
    onlineOrdersResult,
    sanityGroomingBookingsResult,
    [posOrders, odooGroomingAppointments],
  ] = await Promise.all([
    client
      .fetch(
        ORDERS_BY_USER_QUERY,
        { userId, phone: userPhone },
        { cache: "no-store" }
      )
      .catch((err) => {
        console.warn("Could not fetch online orders from Sanity:", err);
        return [];
      }),
    client
      .fetch(
        GROOMING_BOOKINGS_BY_USER_QUERY,
        { userId, phone: userPhone },
        { cache: "no-store" }
      )
      .catch((err) => {
        console.warn("Could not fetch grooming bookings from Sanity:", err);
        return [];
      }),
    withTimeout(odooPromise, 3500, emptyOdooResult),
  ]);

  const onlineOrders = Array.isArray(onlineOrdersResult) ? onlineOrdersResult : [];
  const sanityGroomingBookings = Array.isArray(sanityGroomingBookingsResult) ? sanityGroomingBookingsResult : [];

  // Merge Sanity grooming bookings and Odoo ERP grooming appointments by bookingNumber
  const groomingMap = new Map<string, PortalGroomingAppointment>();

  if (Array.isArray(sanityGroomingBookings)) {
    for (const b of sanityGroomingBookings as any[]) {
      const bookingNumber = b.bookingNumber || b._id;
      let preferredTime = "";
      if (b.appointmentDate) {
        try {
          const d = new Date(b.appointmentDate);
          const hh = String(d.getHours()).padStart(2, "0");
          const mm = String(d.getMinutes()).padStart(2, "0");
          if (hh !== "00" || mm !== "00") {
            preferredTime = `${hh}:${mm}`;
          }
        } catch {
          // ignore
        }
      }
      groomingMap.set(bookingNumber, {
        id: b._id,
        bookingNumber,
        petName: b.petName || "Pet",
        petType: b.petType || "dog",
        breedSize: b.breedSize || "medium",
        package: b.package || "standard",
        price: Number(b.price) || 0,
        appointmentDate: b.appointmentDate || b.createdAt || "",
        preferredTime,
        detangling:
          Array.isArray(b.additionalServices) &&
          b.additionalServices.includes("detangling"),
        status: b.status || "pending",
        notes: b.specialNotes || "",
        source: "sanity",
      });
    }
  }

  for (const oa of odooGroomingAppointments) {
    const existing = groomingMap.get(oa.bookingNumber);
    if (existing) {
      existing.status = oa.status || existing.status;
      existing.source = "odoo";
      if (!existing.preferredTime && oa.preferredTime) {
        existing.preferredTime = oa.preferredTime;
      }
    } else {
      groomingMap.set(oa.bookingNumber, oa);
    }
  }

  const groomingAppointments = Array.from(groomingMap.values()).sort(
    (a, b) =>
      new Date(b.appointmentDate).getTime() -
      new Date(a.appointmentDate).getTime()
  );

  return (
    <CustomerPortalClient
      user={{
        id: userId,
        name: userName,
        email: cleanEmail,
        phone: userPhone,
        odooPartnerId,
        isGuest,
      }}
      onlineOrders={Array.isArray(onlineOrders) ? onlineOrders : []}
      posOrders={posOrders}
      groomingAppointments={groomingAppointments}
    />
  );
}
