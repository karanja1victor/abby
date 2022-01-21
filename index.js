const { writeFile } = require('fs').promises;
const Odds = require('./odds/odds.js');

let janOdds = new Odds();

setTimeout(async () => {
    await writeFile('events.json', await janOdds.events(), 'utf8' );
}, 0);