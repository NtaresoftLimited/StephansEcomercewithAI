const fs = require('fs');
let content = fs.readFileSync('app/(app)/shop/[[...categorySlug]]/page.tsx', 'utf-8');

const schemaLogic = `
  const breadcrumbSchemaList = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Shop",
      "item": "https://www.stephanspetstore.co.tz/shop"
    }
  ];
  breadcrumbs.forEach((crumb, idx) => {
    breadcrumbSchemaList.push({
      "@type": "ListItem",
      "position": idx + 2,
      "name": crumb,
      "item": "https://www.stephanspetstore.co.tz/shop/" + (idx === breadcrumbs.length - 1 && category ? category : "")
    });
  });

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbSchemaList
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-sans overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
`;

content = content.replace('  return (\n    <div className="min-h-screen bg-[#FAF7F2] font-sans overflow-hidden">', schemaLogic);
fs.writeFileSync('app/(app)/shop/[[...categorySlug]]/page.tsx', content, 'utf-8');
console.log("Breadcrumb schema added to shop page");
