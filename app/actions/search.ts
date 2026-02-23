"use server";

import { client } from "@/sanity/lib/client";
import { SEARCH_PRODUCTS_QUERY } from "@/lib/sanity/queries/products";

export async function searchProducts(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const products = await client.fetch(SEARCH_PRODUCTS_QUERY, {
            searchQuery: query,
        });
        return products;
    } catch (error) {
        console.error("Error searching products:", error);
        return [];
    }
}
