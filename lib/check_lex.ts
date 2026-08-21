import { config } from 'dotenv'; config({ path: '.env.local' }); import { client } from '../sanity/lib/client'; async function checkLex() { const r = await client.fetch('*[_type == \
groomingBooking\ && petName == \Lex\] | order(_createdAt desc) [0]'); console.log(r); } checkLex();
