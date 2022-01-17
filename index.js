const { writeFile } = require('fs').promises;
const Odds = require('./odds/odds.js');

let janOdds = new Odds();

setTimeout(async () => {
    // await writeFile('eventsTest.txt', await janOdds.sportpesaOdds(), 'utf8');
    console.log( await janOdds.events()); 
}, 1000);
