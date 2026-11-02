import "server-only";

import { unstable_cache } from "next/cache";
import { odoo } from "@/lib/odoo/client";

/**
 * Odoo is a fallback catalog source for the website. Keep its authentication,
 * category lookup and product lookup out of the critical path on every page
 * request by caching the normalized result for five minutes.
 */
export const getCachedOdooCatalog = unstable_cache(
  async () => {
    const categories = await odoo.getPublicCategories();
    const products = await odoo.getOdooShopProducts(categories);
    return { categories, products };
  },
  ["website-odoo-catalog-v1"],
  { revalidate: 300, tags: ["odoo-catalog"] },
);

export const getCachedOdooCategories = unstable_cache(
  () => odoo.getPublicCategories(),
  ["website-odoo-categories-v1"],
  { revalidate: 300, tags: ["odoo-catalog"] },
);
