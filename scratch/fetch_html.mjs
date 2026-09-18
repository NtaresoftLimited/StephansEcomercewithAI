async function run() {
  const res = await fetch('https://stephanspetstore.co.tz/shop?page=4');
  const html = await res.text();
  const urls = html.match(/https:\/\/cdn\.sanity\.io\/images\/[^"'\\]+/g) || [];
  const odooUrls = html.match(/https:\/\/erp\.stephanspetstore\.co\.tz[^"'\\]+/g) || [];
  
  // also check for PackageOpen SVG or the text "No Image"
  const noImage = html.includes('No Image');
  
  console.log('Sanity images in HTML:', new Set(urls).size);
  console.log('Odoo images in HTML:', new Set(odooUrls).size);
  console.log('Includes "No Image":', noImage);
  
  if (odooUrls.length > 0) {
    console.log('First few Odoo URLs:', odooUrls.slice(0, 3));
  }
}
run();
