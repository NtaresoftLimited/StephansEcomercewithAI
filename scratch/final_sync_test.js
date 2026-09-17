const https = require('https');

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
