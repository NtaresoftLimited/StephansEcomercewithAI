import { odoo } from "./client";

export type GroomingPrices = Record<string, Record<string, Record<string, number>>>;

export async function fetchGroomingPrices(): Promise<GroomingPrices> {
    try {
        // 1. Fetch Services (Packages) to map ID to Name
        const services = await odoo.searchRead(
            "grooming.service",
            [["is_addon", "=", false]], // Only packages
            ["id", "name"]
        );

        // 2. Fetch Prices
        const prices = await odoo.searchRead(
            "grooming.price",
            [],
            ["service_id", "species", "size_category", "price"]
        );

        // 3. Transform to Frontend Format
        const priceMap: GroomingPrices = {
            dog: {},
            cat: {}
        };
        
        // Helper to normalize package name to key
        const getPackageKey = (name: string) => {
            const lower = name.toLowerCase();
            if (lower.includes("super premium")) return "super_premium";
            if (lower.includes("premium")) return "premium";
            if (lower.includes("standard")) return "standard";
            return lower.replace(/\s+/g, "_");
        };

        // Initialize standard structure just in case
        // This ensures the UI doesn't crash if Odoo returns partial data
        ["standard", "premium", "super_premium"].forEach(pkg => {
            if (!priceMap.dog) priceMap.dog = {};
            if (!priceMap.cat) priceMap.cat = {};
            
            priceMap.dog[pkg] = {};
            priceMap.cat[pkg] = {};
        });

        // Map service IDs to keys
        const serviceIdToKey: Record<number, string> = {};
        services.forEach((s: any) => {
            serviceIdToKey[s.id] = getPackageKey(s.name);
        });

        prices.forEach((p: any) => {
            // Odoo returns Many2one as [id, name], we need the ID
            const serviceId = Array.isArray(p.service_id) ? p.service_id[0] : p.service_id;
            const pkgKey = serviceIdToKey[serviceId]; 
            
            if (!pkgKey) return;
            
            const species = p.species;
            const size = p.size_category;
            
            if (!priceMap[species]) priceMap[species] = {};
            if (!priceMap[species][pkgKey]) priceMap[species][pkgKey] = {};
            
            priceMap[species][pkgKey][size] = p.price;
        });

        return priceMap;
    } catch (error) {
        console.error("Failed to fetch grooming prices from Odoo:", error);
        // Return null or empty object? 
        // Better to re-throw or return fallback if we had one here, 
        // but the caller can handle the fallback to constants.
        throw error;
    }
}
