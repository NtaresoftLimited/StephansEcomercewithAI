require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

client.fetch("*[_type == 'category']{title, slug}").then(categories => {
    const titles = categories.map(c => c.title.trim());
    const duplicates = titles.filter((item, index) => titles.indexOf(item) !== index);
    if (duplicates.length > 0) {
        console.log("Duplicate categories and their slugs:");
        const uniqueDups = [...new Set(duplicates)];
        uniqueDups.forEach(dupTitle => {
            const matches = categories.filter(c => c.title.trim() === dupTitle);
            const slugs = matches.map(m => m.slug?.current || "NO_SLUG");
            console.log(`- ${dupTitle}: ${slugs.join(', ')}`);
        });
    }
}).catch(console.error);
