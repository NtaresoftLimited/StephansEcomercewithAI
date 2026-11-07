import { NextResponse } from "next/server";
import { odoo } from "@/lib/odoo/client";

// Resolve LuCy at request time so installing/upgrading the Odoo module does not
// require a Next.js rebuild. CDN headers below still keep this endpoint fast.
export const dynamic = "force-dynamic";

export async function GET() {
  const records = await odoo.getLucyWebsiteNavigation();
  return NextResponse.json(
    { records },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
