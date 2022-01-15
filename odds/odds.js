const puppeteer = require('puppeteer');
const { writeFile } = require('fs').promises;

module.exports = Odds;

function Odds(){
    // this.sportpesaOdds = async () => {
    //     try {
    //         const browser = await puppeteer.launch();
    //         const page = await browser.newPage();
    //         await page.goto('https://www.ke.sportpesa.com/?sportId=1&section=highlights');
            
            
    //         let IDs = await page.$$eval("div > div.event-description-responsive > div.event-text.ng-binding", ids => {
    //             return ids.map(id => id.innerText);
    //         });
    //         let rivals = await page.$$eval("div.event-description > div.event-names.event-column > div", rivals => {
    //             return rivals.map(rival => rival.innerText).filter(rival => rival !== "");
    //         });
    //         let adversaries = [];
    //         for(let i=0; i<rivals.length; i+=2){
    //             let opponents = {};
    //             opponents.home = rivals[i];
    //             opponents.away = rivals[i+1];
    //             adversaries.push(opponents);
    //         }
    //         let odds = await page.$$eval("div > div.upper-to-left.event-bets.ng-scope > div > div.event-selections > div > div.ng-binding", odds => {
    //             return odds.map(odd => odd.innerText);
    //         });
    //         let probabilities = [];
    //         for(let i=0; i<odds.length; i+=10){
    //             let chance = {};
    //             chance[1] = odds[i];
    //             chance["X"] = odds[i+1];
    //             chance[2] = odds[i+2];
    //             chance["1X"] = odds[i+3];
    //             chance["X2"] = odds[i+4];
    //             chance[12] = odds[i+5];
    //             chance["Over"] = odds[i+6];
    //             chance["Under"] = odds[i+7];
    //             chance["GG"] = odds[i+8];
    //             chance["NG"] = odds[i+9];
    //             probabilities.push(chance);
    //         }
            
    //         let data = function (){
                
    //             let data = [];
    //             for(let i=0; i < IDs.length; i++){
    //                 let events = {};
    //                 events["Game Id"] = IDs[i].match(/[0-9]+/gm).join("");
    //                 events["Opponents"] = adversaries[i];
    //                 events["Odds"] = probabilities[i];
    //                 data.push(events);
    //             }
    //             return JSON.stringify(data, null, 2);
    //         }
        
            
            
    //         await browser.close(); 
    //         return data(); 
    //     } catch (err) {
    //         console.error(err);
    //     }
        
    // }
    this.betwayOdds = async function (){
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://www.betway.co.ke/');
            let IDs = await page.$$eval("#eventDetails_0 a > label.ellips.theOtherFont.label__league_title", ids => {
                return ids.map(id => id.innerText);
            });
            let opponents = await page.$$eval("div.inplayStatusDetails > a   b", rivals => {
                return rivals.map(rival => rival.innerText);
            });
            await browser.close();
            let events = [];
            let adversaries = [];
            opponents.forEach(rival => {
                let rivals = {};
                rivals["home"] = rival.split(" v ")[0];
                rivals["away"] = rival.split(" v ")[1];
                adversaries.push(rivals);
            });

            for (let i = 0; i < IDs.length; i++) {
                let games = {};
                games["Game Id"] = IDs[i].match(/[A-Z]{1}[0-9]+/gm).join("");
                games["Opponents"] = adversaries[i];
                events.push(games);
            }
            return JSON.stringify(events, null, 2);
        } catch (err) {
          console.error(err);  
        }
    }
}