require('dotenv').config({ path: '.env' });
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_WRITE_TOKEN,
});

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const taxonomy = [
  {
    name: "DOGS",
    children: [
      { name: "Dog Food", children: ["Puppy Food", "Adult Dog Food", "Senior Dog Food", "Prescription Diet", "Wet / Canned Food"] },
      { name: "Tick, Flea & Deworming", children: ["Tick & Flea Treatments", "Dewormers", "Prevention Products"] },
      { name: "Wellness & Supplements", children: ["Vitamins & Multivitamins", "Supplemental Milk Nutrition", "Joint Support", "Skin & Coat Supplements", "Digestive Support", "Calming Supplements"] },
      { name: "Treats & Chews", children: ["Biscuits Treats", "Crunchy Treats", "Soft Treats", "Dental Chews", "Rawhide Chews", "Gourmet/Specialty Treats"] },
      { name: "Oral Care", children: ["Toothbrushes", "Toothpaste", "Dental Oral Sprays & Gels", "Water Additives"] },
      { name: "Grooming Essentials", children: ["Bath & Shampoo", "Coat Care", "Nail Care", "Ear & Eye Care", "Paw Care", "Wipes & Hygiene", "Pet Perfumes & Sprays"] },
      { name: "Clean Living", children: ["Waste Bags", "Spot & Stain Care", "Cleaning Sprays", "Odor Control", "Pet Rollers"] },
      { name: "Bowls & Feeders", children: ["Food & Water Bowls", "Raised Bowls", "Travel Bowls", "Automatic Feeders", "Multi-purpose / Water Bottle"] },
      { name: "Beds & Blankets", children: ["Dog Beds", "Mats & Pads", "Blankets"] },
      { name: "Home & Crates", children: ["Crates", "Crate Mats & Pads", "Kennels", "Playpens", "Gates & Barriers", "Cages", "Cage Cover", "Storage & Organizations"] },
      { name: "Toys & Plays", children: ["Chew Toys", "Interactive Toys", "Fetch Toys", "Plush Toys", "Rope Toys", "Squeaky Toys", "Water Toys", "Training Toys"] },
      { name: "Collars, Harnesses & Leads", children: ["Collars", "Harnesses", "Leads", "ID Tags", "Reflective & Safety Gear", "Decorated Accessories"] },
      { name: "Pet Apparel", children: ["Dresses", "Jackets", "Sweaters", "Raincoats", "Hoodies, Shirts & T-shirts", "Shoes & Boots", "Female & Male Panties", "Costumes & Dress-up", "Cooling Apparel", "Reflective & Safety Wear", "Accessories"] },
      { name: "Training & Behavior", children: ["Pee Pads / Training Pads", "Pee Pad Trays", "Behavior Aids", "Anti-Bark Products"] },
      { name: "Travel Essentials", children: ["Carriers", "Travel Bags", "Car Seat Covers", "Seat Belts & Restraints"] }
    ]
  },
  {
    name: "CATS",
    children: [
      { name: "Cat Food", children: ["Kitten Food", "Adult Cat Food", "Senior Cat Food", "Prescription Diet", "Wet / Canned Food"] },
      { name: "Tick, Flea & Deworming", children: ["Tick & Flea Treatments", "Dewormers", "Prevention Products"] },
      { name: "Wellness & Supplements", children: ["Hairball Control", "Vitamins & Multivitamins", "Supplemental Milk Nutrition", "Joint Support", "Skin & Coat Supplements", "Digestive Support", "Calming Supplements"] },
      { name: "Treats & Chews", children: ["Biscuit Treats", "Crunchy Treats", "Soft Treats", "Dental Treats", "Catnip Treats", "Liquid / Paste Treats"] },
      { name: "Oral Care", children: ["Toothbrushes", "Toothpaste", "Dental Oral Sprays & Gels", "Water Additives"] },
      { name: "Grooming Essentials", children: ["Bath & Shampoo", "Coat Care", "Nail Care", "Ear & Eye Care", "Paw Care", "Wipes & Hygiene", "Pet Perfumes & Sprays"] },
      { name: "Cat Litter & Clean Living", children: ["Cat Litter", "Litter Trays / Boxes", "Litter Mats", "Litter Box Accessories", "Odor Control", "Pet Roller"] },
      { name: "Bowls & Feeders", children: ["Food & Water Bowls", "Feeding Sets", "Water Fountains", "Raised Bowls", "Travel Bowls", "Automatic Feeders", "Multi-purpose / Water Bottle"] },
      { name: "Beds & Blankets", children: ["Cat Beds", "Mats", "Blankets"] },
      { name: "Scratchers & Cat Housing", children: ["Scratching Posts", "Scratch Pads / Boards", "Cat Trees & Condo's", "Cat Houses", "Window Perches / Hammocks", "Floor Mats, Floor Scratches & Pads"] },
      { name: "Toys & Plays", children: ["Teasers & Wand Toys", "Interactive Toys", "Balls", "Catnip Toys", "Plush Toys", "Laser Toys", "Scratching & Activity Toys", "Automated / Motion Toys"] },
      { name: "Collars & Harnesses", children: ["Collars", "Harnesses", "Leads", "ID Tags", "Reflective & Safety Gear", "Decorated Accessories"] },
      { name: "Pet Apparel", children: ["Dresses", "Jackets", "Sweaters", "Raincoats", "Hoodies, Shirts & T-shirts", "Female & Male Panties", "Costumes & Dress-up", "Cooling Apparel", "Reflective & Safety Wear", "Accessories"] },
      { name: "Travel Essentials", children: ["Carriers", "Travel Bags", "Car Seat Covers", "Seat Belts & Restraints"] }
    ]
  },
  {
    name: "BIRDS",
    children: [
      { name: "Bird Food", children: ["Parrot Food", "Budgie & Small Bird Food", "Premium Seed Mixes", "Pellets"] },
      { name: "Treats & Supplements", children: ["Treat Sticks", "Fruit & Nut Treats", "Calcium Supplements", "Vitamins"] },
      { name: "Homes & Nests", children: ["Bird Cages", "Cage Stands", "Cage Covers", "Cage Liners"] },
      { name: "Perches & Accessories", children: ["Perches & Swings", "Feeding Bowls & Cups", "Ladders & Climbers"] },
      { name: "Toys & Enrichment", children: ["Chew Toys", "Climbing Toys", "Swings", "Bells & Interactive Toys"] },
      { name: "Feeding & Water", children: ["Feeders", "Water Dispensers", "Feeding Bowls"] },
      { name: "Hygiene & Care", children: ["Cage Cleaners", "Grooming Accessories", "Bird Baths", "Feather Care Sprays", "Litter & Cage Liners"] },
      { name: "Travel Essentials", children: ["Travel Cages", "Carrier Bags"] }
    ]
  },
  {
    name: "SMALL PETS",
    children: [
      { name: "Food", children: ["Rabbit Food", "Hamster Food", "Guinea Pig Food", "Mixed Small Pet Food"] },
      { name: "Wellness & Supplements", children: ["Vitamins", "Digestive Support", "Deworming & Care", "General Wellness"] },
      { name: "Treats & Chews", children: ["Biscuits", "Snacks", "Chew Sticks", "Treat Mixes"] },
      { name: "Little Homes", children: ["Cages", "Hutches", "Enclosures", "Bedding", "Wood Shavings"] },
      { name: "Bowls & Feeders", children: ["Food & Water Bowls", "Feeding Cups", "Feeders & Dispensers", "Water Dispensers / Bottles"] },
      { name: "Toys & Plays", children: ["Chew Toys", "Climbing & Chewing Toys", "Tunnels & Hideouts", "Exercise Wheels & Balls"] },
      { name: "Hygiene & Cleaning", children: ["Cage Cleaners", "Odor Control", "Litter & Bedding Cleaners", "Cleaning Accessories"] }
    ]
  }
];

async function createCategory(name, parentId = null) {
  const slug = slugify(name);
  
  // Check if it already exists
  const existing = await client.fetch(`*[_type == "category" && slug.current == $slug][0]`, { slug });
  
  if (existing) {
    console.log(`[SKIP] Category already exists: ${name} (${slug})`);
    
    // Ensure parent reference is correct even if it existed
    if (parentId && (!existing.parentCategory || existing.parentCategory._ref !== parentId)) {
      console.log(`[UPDATE] Setting parent for existing category: ${name}`);
      await client.patch(existing._id).set({ parentCategory: { _type: 'reference', _ref: parentId } }).commit();
    }
    
    return existing._id;
  }

  console.log(`[CREATE] Category: ${name} (${slug})`);
  
  const doc = {
    _type: 'category',
    title: name,
    slug: {
      _type: 'slug',
      current: slug
    }
  };

  if (parentId) {
    doc.parentCategory = {
      _type: 'reference',
      _ref: parentId
    };
  }

  const created = await client.create(doc);
  return created._id;
}

async function run() {
  console.log("Starting Sanity Category Seed Script...");
  console.log("======================================");

  try {
    for (const root of taxonomy) {
      console.log(`\nProcessing Root Category: ${root.name}`);
      const rootId = await createCategory(root.name);

      for (const group of root.children) {
        console.log(`  Processing Group: ${group.name}`);
        const groupId = await createCategory(group.name, rootId);

        if (group.children && group.children.length > 0) {
          for (const sub of group.children) {
            console.log(`    Processing Subcategory: ${sub}`);
            await createCategory(sub, groupId);
          }
        }
      }
    }
    
    console.log("\n======================================");
    console.log("Seed Completed Successfully!");
  } catch (err) {
    console.error("FATAL ERROR during seeding:", err);
  }
}

run();
