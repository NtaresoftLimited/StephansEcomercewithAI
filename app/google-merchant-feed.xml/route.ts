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
function portableTextToPlainText(blocks: any[] = []) {
  if (!blocks || !Array.isArray(blocks)) return "";
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
    // Fetch all products that have a slug and a price
    const products = await client.fetch(`
      *[_type == "product" && defined(slug.current) && price > 0] {
        _id,
        name,
        "slug": slug.current,
        price,
        description,
        "imageUrl": images[0].asset->url,
        "brandName": brand->name,
        stock,
        "categoryTitle": categories[0]->title
      }
    `);

    // Build the XML wrapper
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Stephan's Pet Store - Google Merchant Feed</title>
    <link>${absoluteUrl("/")}</link>
    <description>Product feed for Stephan's Pet Store Dar es Salaam</description>
`;

    // Map each product to a Google Merchant Center <item>
    products.forEach((product: any) => {
      const link = absoluteUrl(`/shop/${product.slug}`);
      const title = escapeXml(product.name);
      
      // Parse description from portable text or fallback to title
      let descriptionStr = portableTextToPlainText(product.description);
      if (!descriptionStr) descriptionStr = "Premium pet product from Stephan's Pet Store.";
      // Limit description length if necessary, but just escape it for now
      const description = escapeXml(descriptionStr.substring(0, 5000));
      
      const imageUrl = product.imageUrl ? escapeXml(product.imageUrl) : "";
      const price = `${product.price} TZS`;
      const availability = product.stock > 0 ? "in_stock" : "out_of_stock";
      const brand = product.brandName ? escapeXml(product.brandName) : "Stephan's Pet Store";
      const productType = product.categoryTitle ? escapeXml(product.categoryTitle) : "Pet Supplies";

      xml += `
    <item>
      <g:id>${product._id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:condition>new</g:condition>
      <g:brand>${brand}</g:brand>
      <g:product_type>${productType}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    });

    xml += `
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error generating Google Merchant Feed:", error);
    return new NextResponse("Error generating feed", { status: 500 });
  }
}
