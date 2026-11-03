import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { odoo } from "@/lib/odoo/client";
import { sanityFetch } from "@/sanity/lib/live";
import { writeClient } from "@/sanity/lib/client";
import { defineQuery } from "next-sanity";

// Diagnostics (Remove in production)
if (!process.env.AUTH_SECRET) {
  console.error("⚠️ AUTH_SECRET is not set! NextAuth will not function correctly.");
}

const CUSTOMER_BY_EMAIL_QUERY = defineQuery(`*[_type == "customer" && email == $email][0]`);
const CUSTOMER_BY_PARTNER_QUERY = defineQuery(
  `*[_type == "customer" && (odooPartnerId == $partnerId || email == $email)][0]`
);

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      odooPartnerId?: number;
      phone?: string;
      authMethod?: "odoo" | "whatsapp" | "guest";
      isGuest?: boolean;
    } & DefaultSession["user"];
  }
}

async function resolveOrSyncCustomer(params: {
  uid: number;
  partnerId: number;
  name: string;
  email: string;
  phone?: string;
}) {
  const { uid, partnerId, name, email, phone } = params;
  const effectiveEmail = email || `${phone?.replace(/\D/g, "") || uid}@whatsapp.stephanspetstore.co.tz`;

  try {
    const { data: existingCustomer } = await sanityFetch({
      query: CUSTOMER_BY_PARTNER_QUERY,
      params: { partnerId, email: effectiveEmail },
    });

    if (existingCustomer) {
      return {
        id: existingCustomer._id,
        email: existingCustomer.email || effectiveEmail,
        name: existingCustomer.name || name,
        odooPartnerId: existingCustomer.odooPartnerId || partnerId,
        phone: phone || "",
      };
    }

    // Auto-provision customer record in Sanity so orders/dossiers link cleanly
    const created = await writeClient.create({
      _type: "customer",
      name,
      email: effectiveEmail,
      odooPartnerId: partnerId,
      userId: partnerId.toString(),
      createdAt: new Date().toISOString(),
    });

    return {
      id: created._id,
      email: effectiveEmail,
      name,
      odooPartnerId: partnerId,
      phone: phone || "",
    };
  } catch (err) {
    console.warn("⚠️ Sanity customer sync fallback:", err);
    return {
      id: partnerId.toString(),
      email: effectiveEmail,
      name,
      odooPartnerId: partnerId,
      phone: phone || "",
    };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    // 1. Native Odoo Email & Password Provider
    Credentials({
      id: "credentials",
      name: "Odoo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const emailInput = (credentials.email as string).trim();
          const uid = await odoo.authenticateUser(
            emailInput,
            credentials.password as string
          );

          if (!uid) {
            console.error("Odoo authentication failed for", emailInput);
            return null;
          }

          const profile = await odoo.getUserProfile(uid);
          const partnerId = profile?.partnerId || uid;
          const displayName = profile?.name || emailInput;
          const resolved = await resolveOrSyncCustomer({
            uid,
            partnerId,
            name: displayName,
            email: profile?.email || emailInput,
            phone: profile?.phone,
          });

          return {
            ...resolved,
            authMethod: "odoo",
            isGuest: false,
          };
        } catch (error) {
          console.error("Odoo Auth error:", error);
          return null;
        }
      },
    }),

    // 2. Native Odoo WhatsApp OTP Provider (Protected 6-digit HMAC OTP verified by Odoo res.users)
    Credentials({
      id: "whatsapp-otp",
      name: "WhatsApp OTP",
      credentials: {
        phone: { label: "WhatsApp Number", type: "text" },
        otp: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        const phone = (credentials?.phone as string | undefined)?.trim();
        const otp = (credentials?.otp as string | undefined)?.trim();
        if (!phone || !otp) return null;

        try {
          const verified = await odoo.authenticateWhatsAppOtp(phone, otp);
          if (!verified) {
            console.error("WhatsApp OTP verification failed for", phone);
            return null;
          }

          const resolved = await resolveOrSyncCustomer({
            uid: verified.uid,
            partnerId: verified.partnerId,
            name: verified.name,
            email: verified.email,
            phone: verified.phone,
          });

          return {
            ...resolved,
            phone: verified.phone,
            authMethod: "whatsapp",
            isGuest: false,
          };
        } catch (error) {
          console.error("WhatsApp OTP Auth error:", error);
          return null;
        }
      },
    }),

    // 3. Protected Guest Session Provider
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: {
        name: { label: "Name", type: "text" },
        phone: { label: "Phone", type: "text" },
      },
      async authorize(credentials) {
        const guestName =
          (credentials?.name as string | undefined)?.trim() || "Guest Shopper";
        const guestPhone =
          (credentials?.phone as string | undefined)?.trim() || "";
        const guestId = `guest_${Date.now().toString(36)}`;

        return {
          id: guestId,
          name: guestName,
          email: "",
          phone: guestPhone,
          authMethod: "guest",
          isGuest: true,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.odooPartnerId = (user as any).odooPartnerId;
        token.phone = (user as any).phone;
        token.authMethod = (user as any).authMethod || "odoo";
        token.isGuest = Boolean((user as any).isGuest);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.odooPartnerId = token.odooPartnerId as number | undefined;
        session.user.phone = token.phone as string | undefined;
        session.user.authMethod = token.authMethod as
          | "odoo"
          | "whatsapp"
          | "guest"
          | undefined;
        session.user.isGuest = Boolean(token.isGuest);
      }
      return session;
    },
    async authorized({ request, auth }) {
      return true; // Allow browsing & guest checkout; protected routes enforce auth where needed
    },
  },
  pages: {
    signIn: "/login",
  },
});
