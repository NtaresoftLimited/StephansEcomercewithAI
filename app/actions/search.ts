"use server";

import { client } from "@/sanity/lib/client";
import { SEARCH_PRODUCTS_QUERY, FEATURED_PRODUCTS_QUERY } from "@/lib/sanity/queries/products";
import { ALL_BRANDS_QUERY } from "@/lib/sanity/queries/brands";

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

export async function getFeaturedProducts() {
    try {
        const products = await client.fetch(FEATURED_PRODUCTS_QUERY);
        return products;
    } catch (error) {
        console.error("Error fetching featured products:", error);
        return [];
    }
}

export async function getAllBrands() {
    try {
        const brands = await client.fetch(ALL_BRANDS_QUERY);
        return brands;
    } catch (error) {
        console.error("Error fetching brands:", error);
        return [];
    }
}
