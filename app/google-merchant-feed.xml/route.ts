import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

// XML escape helper to avoid breaking the feed
function escapeXml(unsafe: string) {
  if (!unsafe) return "";
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

// Plain text extractor for portable text descriptions
function portableTextToPlainText(blocks: any) {
  if (!blocks) return "";
  if (typeof blocks === "string") return blocks;
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return "";
      }
      return block.children.map((child: any) => child.text).join("");
    })
    .join("\n");
}

export async function GET() {
  try {
    // Fetch all products that have a slug and a price > 0
    const products = await client.fetch(`
      *[_type == "product" && defined(slug.current) && price > 0] {
        _id,
        name,
        "slug": slug.current,
        price,
        description,
        "images": images[].asset->url,
        "brandName": brand->name,
        "categoryTitle": categories[0]->title
      } | order(name asc)
    `);

    // Build the XML wrapper
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Stephan's Pet Store - Google Merchant Feed</title>
    <link>${absoluteUrl("/")}</link>
    <description>Official Google Merchant Center Product Feed for Stephan's Pet Store Dar es Salaam (Slipway Masaki and Mikocheni branches)</description>
`;

    // Map each product to a Google Merchant Center <item>
    products.forEach((product: any) => {
      const link = absoluteUrl(`/shop/${product.slug}`);
      const title = escapeXml(product.name);
      
      // Parse description from portable text or build rich localized description
      let descriptionStr = portableTextToPlainText(product.description);
      if (!descriptionStr || descriptionStr.trim().length === 0) {
        descriptionStr = `Buy ${product.name} at Stephan's Pet Store in Dar es Salaam, Tanzania. Premium pet food, accessories, and supplies available at Slipway Masaki and Mikocheni branches with fast local delivery across Dar es Salaam.`;
      } else {
        descriptionStr = `${descriptionStr.trim()} | Stephan's Pet Store Dar es Salaam (Slipway Masaki & Mikocheni). Fast local delivery.`;
      }
      const description = escapeXml(descriptionStr.substring(0, 5000));
      
      const images: string[] = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
      const mainImageUrl = images[0] ? escapeXml(images[0]) : escapeXml(absoluteUrl("/og-image.png"));
      const price = `${product.price} TZS`;
      const brand = product.brandName ? escapeXml(product.brandName) : "Stephan's Pet Store";
      const productType = product.categoryTitle 
        ? escapeXml(`Pet Supplies > ${product.categoryTitle}`) 
        : "Pet Supplies";

      xml += `
    <item>
      <g:id>${escapeXml(product._id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${mainImageUrl}</g:image_link>`;

      // Add up to 5 additional images if available
      for (let i = 1; i < Math.min(images.length, 6); i++) {
        xml += `
      <g:additional_image_link>${escapeXml(images[i])}</g:additional_image_link>`;
      }

      xml += `
      <g:availability>in_stock</g:availability>
      <g:price>${price}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${brand}</g:brand>
      <g:google_product_category>505374</g:google_product_category>
      <g:product_type>${productType}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:custom_label_0>Dar es Salaam</g:custom_label_0>
      <g:custom_label_1>Masaki &amp; Mikocheni</g:custom_label_1>
      <g:custom_label_2>${escapeXml(product.categoryTitle || "General")}</g:custom_label_2>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error generating Google Merchant Feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
