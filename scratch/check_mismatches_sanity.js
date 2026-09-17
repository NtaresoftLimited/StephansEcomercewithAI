require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, 
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: false,
  apiVersion: '2023-05-03',
});

client.fetch("*[_type == 'product']{name, 'categories': category->title}").then(products => {
    let mismatches = [];
    
    products.forEach(p => {
        if (!p.name || !p.categories) return;
        
        const name = p.name;
        const cat_name = Array.isArray(p.categories) ? p.categories.join(' ') : p.categories;
        
        const name_lower = name.toLowerCase();
        const cat_lower = cat_name.toLowerCase();
        
        const is_dog_product = name_lower.includes(' dog') || name_lower.includes('dog ') || name_lower.includes('puppy') || name_lower.startsWith('dog');
        const is_cat_product = name_lower.includes(' cat') || name_lower.includes('cat ') || name_lower.includes('kitten') || name_lower.startsWith('cat');
        const is_bird_product = name_lower.includes('bird') || name_lower.includes('parrot');
        const is_small_product = name_lower.includes('hamster') || name_lower.includes('rabbit') || name_lower.includes('guinea pig');
        
        const is_dog_cat = cat_lower.includes('dogs') || cat_lower.includes('dog');
        const is_cat_cat = cat_lower.includes('cats') || cat_lower.includes('cat');
        const is_bird_cat = cat_lower.includes('birds') || cat_lower.includes('bird');
        const is_small_cat = cat_lower.includes('small animal') || cat_lower.includes('hamster') || cat_lower.includes('rabbit');
        
        if (is_dog_product && is_cat_product) return;
        
        if (is_dog_product && is_cat_cat && !is_dog_cat) {
            mismatches.push(`[Sanity] '${name}' is in category '${cat_name}'`);
        } else if (is_cat_product && is_dog_cat && !is_cat_cat) {
            mismatches.push(`[Sanity] '${name}' is in category '${cat_name}'`);
        } else if (is_bird_product && not_bird_but_other(cat_lower)) {
            mismatches.push(`[Sanity] '${name}' is in category '${cat_name}'`);
        } else if (is_small_product && not_small_but_other(cat_lower)) {
            mismatches.push(`[Sanity] '${name}' is in category '${cat_name}'`);
        }
        
        function not_bird_but_other(c) {
            return !c.includes('bird') && (c.includes('dog') || c.includes('cat') || c.includes('small animal'));
        }
        function not_small_but_other(c) {
            return !c.includes('small animal') && !c.includes('hamster') && !c.includes('rabbit') && (c.includes('dog') || c.includes('cat') || c.includes('bird'));
        }
    });
    
    console.log(`Found ${mismatches.length} potential mismatches in Sanity.`);
    mismatches.slice(0, 20).forEach(m => console.log(m));
}).catch(console.error);
