const Odds = require('./odds/odds.js');
const { readFile } = require('fs').promises;

function abby(odds) {
    this.odds = odds;
    this.twoWayEvents = async function () {
        try {
            let games = await this.odds;
            let events = games.map((event) => {
                let id = event["Game Id"];
                let sportpesaOver = event.sportpesaOdds['O2.5'];
                let sportpesaUnder = event.sportpesaOdds['U2.5'];
                let sportpesaGG = event.sportpesaOdds['GG'];
                let sportpesaNGG = event.sportpesaOdds['NGG'];
                let betwayOver = event.betwayOdds['O2.5'];
                let betwayUnder = event.betwayOdds['U2.5'];
                let betwayGG = event.betwayOdds['GG'];
                let betwayNGG = event.betwayOdds['NGG'];
                
                let twoWayEvent = {};
                twoWayEvent["Game Id"] = id;
                twoWayEvent["sportpesaOdds"] = {
                    "O2.5": sportpesaOver,
                    "U2.5": sportpesaUnder,
                    "GG": sportpesaGG,
                    "NGG": sportpesaNGG
                };
                twoWayEvent["betwayOdds"] = {
                    "O2.5": betwayOver,
                    "U2.5": betwayUnder,
                    "GG": betwayGG,
                    "NGG": betwayNGG
                };
                return twoWayEvent;
                
            });
            return events;
        }catch (err) {
            console.error(err);
        }
    }
    this.potentialEvents = async function () {
        try {
            let processedEvents = await this.twoWayEvents();
            function filterValues(item){
                for (const odd in item.sportpesaOdds) {
                    let odd2 = '';
                    switch (odd) {
                        case 'O2.5':
                            odd2 = 'U2.5'
                            break;
                        case 'U2.5':
                            odd2 = 'O2.5'
                            break;
                        case 'GG':
                            odd2 = 'NGG'
                            break;
                        case 'NGG':
                            odd2 = 'GG'
                            break;
                    }
                    let arbPer1 = (1 / Number(item.sportpesaOdds[odd]))*100;
                    let arbPer2 = (1 / Number(item.betwayOdds[odd2]))*100;
                    if ((arbPer1 + arbPer2) < 100) {
                        return true;
                    }else {
                        return false;
                    }
                }
                
            }
            return processedEvents.filter(event => filterValues(event));
        } catch (err) {
            console.error(err);
        }
    }
    this.arbBets = async function(){
        try {
            let potentialEvents = await this.potentialEvents();
            function arbObject (item) {
                let info = [];
                for (let odd in item.sportpesaOdds) {
                    let odd2 = '';
                    switch (odd) {
                        case 'O2.5':
                            odd2 = 'U2.5'
                            break;
                        case 'U2.5':
                            odd2 = 'O2.5'
                            break;
                        case 'GG':
                            odd2 = 'NGG'
                            break;
                        case 'NGG':
                            odd2 = 'GG'
                            break;
                    }
                    let arbPer1 = (1 / Number(item.sportpesaOdds[odd]))*100;
                    let arbPer2 = (1 / Number(item.betwayOdds[odd2]))*100;
                    let id = item["Game Id"];
                    let sportpesa = odd;
                    let betway = odd2;
                    info.push({
                        id,
                        "sportpesa" : sportpesa, 
                        "betway" : betway,
                        "Potential" : arbPer2+arbPer1,
                    });
                }
            return info;
            }
        return potentialEvents.map(event => arbObject(event));  
        } catch (error) {
            console.error(error);
        }
    }
}

setTimeout(async () => {
    
    let odds1 = new Odds();
    let odds = await odds1.events();
    let inputOdds = await JSON.parse(odds);
    
    let POC = new abby(await inputOdds);
    
    console.log(odds, await POC.twoWayEvents(), await POC.potentialEvents(), await POC.arbBets());
}, 0);