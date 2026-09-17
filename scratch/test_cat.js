require('dotenv').config();
const { createClient } = require('@sanity/client');
const sanityClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: "2023-05-03",
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
});

async function getOrCreateCategory(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existing = await sanityClient.fetch(
        `*[_type == "category" && slug.current == $slug][0]`,
        { slug }
    );
    
    if (existing) return existing._id;
    
    const cat = await sanityClient.create({
        _type: "category",
        title: name,
        slug: { _type: "slug", current: slug }
    });
    return cat._id;
}
getOrCreateCategory("Water Fountains").then(console.log).catch(e => console.error("Error:", e.message));
