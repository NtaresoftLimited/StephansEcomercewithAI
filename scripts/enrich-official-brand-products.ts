import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { createClient } from "@sanity/client";
import { randomUUID } from "crypto";
import https from "https";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-12-05",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

type Target = {
  id: string;
  expectedName: string;
  description: string;
  source: string;
  images: string[];
};

const targets: Target[] = [
  {
    id: "odoo-1097",
    expectedName: "Bioline Neutral Shampoo 250mls",
    description: "A fragrance-free and colourant-free mild shampoo for dogs and cats. Its gentle cleansing formula is suitable for routine coat care and pets that benefit from a simple, neutral wash.\n\nSize: 250 ml\nSuitable for: Dogs and cats\nKey benefit: Mild everyday cleansing without added fragrance or colourant.",
    source: "https://www.biolinepet.com/neutral-shampoo.html",
    images: [
      "https://www.biolinepet.com/wp-content/uploads/2022/12/2006-1.jpg",
      "https://www.biolinepet.com/wp-content/uploads/2022/12/2006-2.jpg",
      "https://www.biolinepet.com/wp-content/uploads/2022/12/Neutralshampoo04.jpg",
    ],
  },
  {
    id: "odoo-885",
    expectedName: "Bioline Mink Oil Shampoo 250mls",
    description: "A coat-care shampoo formulated with mink oil to replenish natural coat oils and leave the fur softer, smoother and more lustrous after washing.\n\nSize: 250 ml\nSuitable for: Dogs\nKey benefit: Supports coat softness and shine while cleansing.",
    source: "https://www.biolinepet.com/mink-oil-shampoo.html",
    images: [
      "https://www.biolinepet.com/wp-content/uploads/2022/12/2007-1.jpg",
      "https://www.biolinepet.com/wp-content/uploads/2022/12/2007-2.jpg",
      "https://www.biolinepet.com/wp-content/uploads/2022/12/minkoilshampoo05.jpg",
    ],
  },
  {
    id: "odoo-763",
    expectedName: "Bioline Calming Shampoo For Dog 250mls",
    description: "A gentle dog shampoo with chamomile and lavender, developed to cleanse the coat while helping create a calmer grooming experience. It is especially useful for pets that can feel unsettled during bathing or in unfamiliar environments.\n\nSize: 250 ml\nSuitable for: Dogs\nKey benefit: Gentle cleansing with calming botanical ingredients.",
    source: "https://www.biolinepet.com/calming-shampoo.html",
    images: [
      "https://www.biolinepet.com/wp-content/uploads/2023/01/2409-1.jpg",
      "https://www.biolinepet.com/wp-content/uploads/2023/01/2409-2.jpg",
      "https://www.biolinepet.com/wp-content/uploads/2023/01/calming-shampoo03.jpg",
    ],
  },
  {
    id: "odoo-3051",
    expectedName: "Summit 10 WholeChoice Adult Medium Chicken 10-kg",
    description: "Complete and balanced grain-free dry food for adult medium and large dogs from one year of age. Deboned fresh chicken is the principal recipe feature, supported by potato, legumes, salmon oil, vegetables, fruit, prebiotics, glucosamine and chondroitin.\n\nSize: 10 kg\nLife stage: Adult dog\nKey benefits: Highly digestible protein, digestive support, skin and coat support, and joint-supporting nutrients.\nAnalytical constituents: Protein 26%, fat 16%, fibre 2.5%, ash 6.5%.",
    source: "https://summit10.com/dog/whole-choice/adult-dog-chicken-recipe/",
    images: [
      "https://summit10.com/wp-content/uploads/2024/10/Summit-10-Whole-Choice-Adult-Medium-Chicken-10-kg-Bag-2.png",
      "https://summit10.com/wp-content/uploads/2024/10/Croqueta.png",
      "https://summit10.com/wp-content/uploads/2024/10/Chicken.png",
    ],
  },
  {
    id: "odoo-2490",
    expectedName: "Summit 10 Whole Choice Adult Salmon 2kg",
    description: "Complete and balanced grain-free dry food for adult medium and large dogs from one year of age. The recipe features deboned fresh salmon, a naturally palatable source of quality protein and omega-3 fatty acids, together with potato, legumes, salmon oil, vegetables, fruit, prebiotics and joint-supporting nutrients.\n\nSize: 2 kg\nLife stage: Adult dog\nKey benefits: Digestive support, quality fish protein, omega-3 fatty acids, and skin and coat support.\nAnalytical constituents: Protein 28%, fat 16%, fibre 1.9%, ash 6.5%.",
    source: "https://summit10.com/whole-choice/adult-dog-fresh-salmon/",
    images: [
      "https://summit10.com/wp-content/uploads/2024/10/Summit-10-Whole-Choice-Adult-Salmon.png",
      "https://summit10.com/wp-content/uploads/2024/10/Croqueta_salmon_whole_choise.png",
      "https://summit10.com/wp-content/uploads/2024/10/Salmon-1.png",
    ],
  },
  {
    id: "odoo-2493",
    expectedName: "Summit 10 Grain Free Fresh Chicken and potato 3kg",
    description: "Complete and balanced grain-free dry food for adult dogs of all breeds from one year of age. Fresh chicken and potato are the principal ingredients, making the recipe suitable for dogs with sensitive digestion or those requiring additional skin and coat care.\n\nSize: 3 kg\nLife stage: Adult dog\nKey benefits: Single-animal-protein recipe, grain-free nutrition, highly digestible chicken and digestive prebiotics.\nAnalytical constituents: Protein 26%, fat 16%, fibre 3.5%, ash 8%.",
    source: "https://summit10.com/dog/grain-free/adult-dog-fresh-chicken-potato/",
    images: [
      "https://summit10.com/wp-content/uploads/2025/07/Grain-Free_Dog_Chicken-Potatoes.png",
      "https://summit10.com/wp-content/uploads/2024/10/Chicken.png",
      "https://summit10.com/wp-content/uploads/2024/10/tubers.png",
    ],
  },
];

function downloadOnce(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    const request = https.get(encodeURI(url), {
      headers: { "user-agent": "Mozilla/5.0 StephansPetStoreCatalog/1.0" },
      timeout: 60_000,
    }, (response) => {
      if (response.statusCode && response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        downloadOnce(new URL(response.headers.location, url).toString()).then(resolve, reject);
        return;
      }
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`${response.statusCode}: ${url}`));
        return;
      }
      const contentType = response.headers["content-type"] || "application/octet-stream";
      if (!contentType.startsWith("image/")) {
        response.resume();
        reject(new Error(`Not an image (${contentType}): ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      response.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType }));
      response.on("error", reject);
    });
    request.on("timeout", () => request.destroy(new Error(`Timeout: ${url}`)));
    request.on("error", reject);
  });
}

async function download(url: string) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await downloadOnce(url);
    } catch (error) {
      lastError = error;
      console.warn(`  Download attempt ${attempt}/4 failed: ${url}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }
  throw lastError;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const ids = targets.map((target) => target.id);
  const records = await client.fetch(`*[_id in $ids]{_id, name, "imageCount": count(images)}`, { ids });
  const byId = new Map(records.map((record: any) => [record._id, record]));

  for (const target of targets) {
    const record: any = byId.get(target.id);
    if (!record) throw new Error(`Missing target ${target.id}`);
    if (record.name.trim() !== target.expectedName) {
      throw new Error(`Name mismatch for ${target.id}: ${record.name}`);
    }
    console.log(`${apply ? "UPDATE" : "DRY RUN"}: ${record.name} (${record.imageCount} -> 3 images)`);
    console.log(`  Source: ${target.source}`);

    if (!apply) continue;

    const images = [];
    for (let index = 0; index < target.images.length; index += 1) {
      const url = target.images[index];
      const { buffer, contentType } = await download(url);
      const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const asset = await client.assets.upload("image", buffer, {
        filename: `${target.id}-official-${index + 1}.${extension}`,
        contentType,
      });
      images.push({
        _type: "image",
        _key: randomUUID(),
        asset: { _type: "reference", _ref: asset._id },
      });
    }

    await client.patch(target.id).set({ description: target.description, images }).commit();
    console.log(`  Updated ${target.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
