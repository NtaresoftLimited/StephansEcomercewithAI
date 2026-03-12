import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { odoo } from "@/lib/odoo/client";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "next-sanity";

const CUSTOMER_BY_EMAIL_QUERY = defineQuery(`*[_type == "customer" && email == $email][0]`);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Odoo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // 1. Authenticate with Odoo
          const uid = await odoo.authenticateUser(
            credentials.email as string,
            credentials.password as string
          );

          if (!uid) {
            console.error("Odoo authentication failed for", credentials.email);
            return null;
          }

          // 2. Get user info from Sanity or Odoo
          // We prefer Sanity for website-specific metadata
          const { data: customer } = await sanityFetch({
            query: CUSTOMER_BY_EMAIL_QUERY,
            params: { email: credentials.email },
          });

          if (!customer) {
            // If they exist in Odoo but not in Sanity, we should probably sync them here
            // or just return enough info to create the session
            return {
              id: uid.toString(),
              email: credentials.email as string,
              name: credentials.email as string, // Fallback
              odooPartnerId: uid,
            };
          }

          return {
            id: customer._id,
            email: customer.email,
            name: customer.name,
            odooPartnerId: customer.odooPartnerId || uid,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.odooPartnerId = (user as any).odooPartnerId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).odooPartnerId = token.odooPartnerId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
