require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function fixElevatedBowls() {
    const categories = await client.fetch("*[_type == 'category']{title, _id, 'slug': slug.current}");
    
    const catElevated = categories.find(c => c.slug === 'cats-bowls-feeders-elevated-bowls');
    const dogElevated = categories.find(c => c.slug === 'dogs-bowls-feeders-elevated-bowls');
    
    if (!catElevated || !dogElevated) {
        console.error("Categories not found!");
        return;
    }
    console.log("Found Cat Category:", catElevated._id);
    console.log("Found Dog Category:", dogElevated._id);

    const elevatedProductNames = [
        "Cartoon Shaped ceramic Pet Bowl",
        "Ceramic Elevated double Bowl",
        "Ceramic Pet Bowl With Whiskas",
        "Cheese Shaped Ceramic Bowl L",
        "Chicken Shaped Ceramic Pet Bowl",
        "Dining Table Double Ceramic Bowl",
        "Double Ceramic Bowl With Plastic Stand",
        "Duck Shaped Ceramic Pet bowl",
        "Elephant Leg Shaped Ceramic Cat Bowl",
        "Elevated Ceramic Pet Bowl L",
        "Elevated Ceramic Pet Bowl S",
        "Pakeaway Cat Feed Bowl",
        "Piggy Shaped Elevated Ceramic Cat Bowl",
        "Transparent Cat Eating Bowl",
        "Transparent Cat Eating Double Bowl",
        "Wooden Hanging Ceramic Bowl"
    ];

    const products = await client.fetch("*[_type == 'product']{name, _id, categories}");
    
    let moved = 0;
    for (const p of products) {
        if (elevatedProductNames.includes(p.name)) {
            await client.patch(p._id)
                .setIfMissing({ categories: [] })
                .set({
                    categories: [
                        { _type: 'reference', _key: Math.random().toString(36).substring(7), _ref: catElevated._id },
                        { _type: 'reference', _key: Math.random().toString(36).substring(7), _ref: dogElevated._id }
                    ]
                })
                .unset(['category'])
                .commit();
            console.log(`Mapped ${p.name} -> Both Cats & Dogs Elevated Bowls`);
            moved++;
        }
    }
    console.log(`Total mapped: ${moved}`);
}
fixElevatedBowls().catch(console.error);
