const puppeteer = require('puppeteer');
const { writeFile } = require('fs').promises;

module.exports = Odds;

function Odds(){
    this.sportpesaURL = "https://www.ke.sportpesa.com/?sportId=1&section=country&countryId=61&leagueId=67600&name=Premier%20League";
    this.betwayURL = "https://www.betway.co.ke/sport/soccer/eng/premier_league/";
    this.betikaURL = "https://www.betika.com/s/soccer/england-premier-league";
    this.browserSessionInfo = async (url) => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        let IDs = await page.$$eval("div > div.event-description-responsive > div.event-text.ng-binding", ids => {
            return ids.map(id => id.innerText);
        });
        let rivals = await page.$$eval("div.event-description > div.event-names.event-column > div", rivals => {
            return rivals.map(rival => rival.innerText).filter(rival => rival !== "");
        });
        let odds = await page.$$eval("div > div.upper-to-left.event-bets.ng-scope > div > div.event-selections > div > div.ng-binding", odds => {
            return odds.map(odd => odd.innerText);
        });
        function addArray (...arrays) {
            let newArray = [];
            for (let i = 0; i < arrays.length; i++) {
                newArray.push(arrays[i]);
            }
            return newArray;
        }
        await browser.close();
        return addArray(IDs, rivals, odds);
    }
    this.IDs = async (sessionData) => {
        let IDs = sessionData[0];
        if (IDs.length === 0) {
            throw new Error("Selector for IDs not found");
        } else {
            let refIDs = IDs.map(id => id.match(/[0-9]+/gm).join(""));
            return refIDs; 
        }
    }    
    this.opponents = async (sessionData) => {
        let rivals = sessionData[1];       
        if (rivals.length === 0) {
            throw new Error("Selector for opponents not found");
        } else {
            let adversaries = [];
            for(let i=0; i<rivals.length; i+=2){
                let opponents = {};
                opponents.home = rivals[i];
                opponents.away = rivals[i+1];
                adversaries.push(opponents);
            }
            return adversaries;
        }       
    }
    
    this.sportpesaOdds = async (sessionData) => {
        let odds = sessionData[2];
        if (odds.length === 0) {
            throw new Error("Selector for sportpesaOdds not found");
        } else {
            let probabilities = [];
            for(let i=0; i<odds.length; i+=10){
                let chance = {};
                chance[1] = odds[i];
                chance["X"] = odds[i+1];
                chance[2] = odds[i+2];
                chance["1X"] = odds[i+3];
                chance["X2"] = odds[i+4];
                chance[12] = odds[i+5];
                chance["Over"] = odds[i+6];
                chance["Under"] = odds[i+7];
                chance["GG"] = odds[i+8];
                chance["NG"] = odds[i+9];
                probabilities.push(chance);
            }
            return probabilities;
        }       
    }
    this.betwayOdds = async (url) => {
        
            
            
    }
    this.events = async () => {
        try { 
            let url = this.sportpesaURL;
            let sessionData = await this.browserSessionInfo(url);
            let IDs = await this.IDs(sessionData);
            let adversaries = await this.opponents(sessionData);
            let sportpesaOdds = await this.sportpesaOdds(sessionData);
            let data = () => {                
                let data = [];
                for(let i=0; i < IDs.length; i++){
                    let events = {};
                    events["Game Id"] = IDs[i];
                    events["Opponents"] = adversaries[i];
                    events["sportpesaOdds"] = sportpesaOdds[i];
                    data.push(events);
                }
                return JSON.stringify(data, null, 2);
            }
            return data();
        } catch (err) {
            console.error(err);
        }  
    }         
}