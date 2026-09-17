const fs = require('fs');
let content = fs.readFileSync('app/layout.tsx', 'utf-8');

const websiteSchema = `
    {
      "@type": "WebSite",
      "@id": "https://www.stephanspetstore.co.tz/#website",
      "url": "https://www.stephanspetstore.co.tz",
      "name": "Stephan's Pet Store",
      "description": "Tanzania's leading pet store. Shop premium pet food, accessories, dog beds, dog cages, grooming services & more.",
      "publisher": {
        "@id": "https://www.stephanspetstore.co.tz/#store-masaki"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://www.stephanspetstore.co.tz/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },`;

// Insert the WebSite schema before the first PetStore schema in the @graph array
content = content.replace('"@graph": [', '"@graph": [' + websiteSchema);

fs.writeFileSync('app/layout.tsx', content, 'utf-8');
console.log("WebSite schema added to layout.tsx");
