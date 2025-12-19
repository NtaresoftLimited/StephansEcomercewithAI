
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@sanity/client";

const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2025-12-05',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

// New pet store categories
const PET_CATEGORIES = [
    { _id: "category-dog-food", title: "Dog Food", slug: "dog-food" },
    { _id: "category-cat-food", title: "Cat Food", slug: "cat-food" },
    { _id: "category-pet-treats", title: "Pet Treats", slug: "pet-treats" },
    { _id: "category-pet-accessories", title: "Accessories", slug: "accessories" },
    { _id: "category-grooming", title: "Grooming", slug: "grooming" },
    { _id: "category-health", title: "Health & Wellness", slug: "health" },
];

// Keywords to categorize products
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    "category-dog-food": ["dog food", "puppy food", "kibble"],
    "category-cat-food": ["cat food", "kitten food", "whiskas", "felix"],
    "category-pet-treats": ["treat", "snack", "beeno", "biscuit", "rollies", "flatties", "mallow"],
    "category-grooming": ["shampoo", "brush", "comb", "conditioner", "soap", "spray", "cologne", "powder", "wipes"],
    "category-health": ["flea", "tick", "collar", "vitamin", "supplement", "dental", "dewormer", "medicine"],
    "category-pet-accessories": ["bed", "leash", "harness", "toy", "bowl", "cloth", "cage", "carrier", "bottle"],
};

async function fixCategoriesAndProducts() {
    console.log("🔧 Fixing categories and product assignments...\n");

    // 1. Delete old furniture categories
    console.log("1. Deleting old furniture categories...");
    const oldCategories = await client.fetch(`*[_type == "category"]{_id}`);
    for (const cat of oldCategories) {
        try {
            await client.delete(cat._id);
            console.log(`   Deleted ${cat._id}`);
        } catch (e) {
            console.log(`   Could not delete ${cat._id} (may have references)`);
        }
    }

    // 2. Create new pet categories
    console.log("\n2. Creating new pet categories...");
    for (const cat of PET_CATEGORIES) {
        await client.createOrReplace({
            _type: "category",
            _id: cat._id,
            title: cat.title,
            slug: { _type: "slug", current: cat.slug },
        });
        console.log(`   Created ${cat.title}`);
    }

    // 3. Re-assign products to correct categories
    console.log("\n3. Categorizing products...");
    const products = await client.fetch(`*[_type == "product"]{_id, name}`);

    for (const product of products) {
        const name = product.name.toLowerCase();
        let assignedCategory = "category-pet-accessories"; // Default

        for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(kw => name.includes(kw))) {
                assignedCategory = categoryId;
                break;
            }
        }

        await client.patch(product._id)
            .set({ category: { _type: "reference", _ref: assignedCategory } })
            .commit();
    }
    console.log(`   Categorized ${products.length} products.`);

    console.log("\n✅ Done!");
}

fixCategoriesAndProducts();
