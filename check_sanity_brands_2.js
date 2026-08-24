const { createClient } = require('next-sanity');
const client = createClient({projectId:'ubqcgegx', dataset:'production', apiVersion:'2025-12-05', useCdn:false});
client.fetch('*[_type == "brand"]{name, slug, odooId}').then(console.log);
