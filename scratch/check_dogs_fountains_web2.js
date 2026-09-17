const https = require('https');

https.get('https://www.stephanspetstore.co.tz/shop/dogs-bowls-feeders-water-fountains', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        if (data.includes('Pet Water Fountain')) console.log("Pet Water Fountain Found!");
        if (data.includes('Water Fountain Filter')) console.log("Filter Found!");
        console.log("HTML:", data.substring(data.indexOf('<h3'), data.indexOf('<h3') + 500));
    });
});
