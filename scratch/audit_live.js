const https = require('https');

function checkUrl(url, label) {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const h3Count = (data.match(/<h3/g) || []).length;
            console.log(`${label}: HTTP ${res.statusCode} - Found ${h3Count} items (approx)`);
            if (label === 'Sync API') {
                console.log('Sync API Response:', data.substring(0, 200));
            }
        });
    }).on('error', console.error);
}

checkUrl('https://www.stephanspetstore.co.tz/shop/dogs-bowls-feeders-water-fountains', 'Dogs Fountains');
checkUrl('https://www.stephanspetstore.co.tz/shop/cats-bowls-feeders-water-fountains', 'Cats Fountains');

const req = https.request('https://www.stephanspetstore.co.tz/api/odoo/sync', { method: 'POST' }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Sync API Status:', res.statusCode);
        console.log('Sync API Response:', data);
    });
});
req.on('error', console.error);
req.end();

