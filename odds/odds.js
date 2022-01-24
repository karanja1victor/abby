const puppeteer = require('puppeteer');

module.exports = Odds;

function Odds() {
        this.sportpesaURL = "https://www.ke.sportpesa.com/?sportId=1&section=country&countryId=61&leagueId=67600&name=Premier%20League";
        this.betwayURL = "https://www.betway.co.ke/sport/soccer/eng/premier_league/";
        this.betikaURL = "https://www.betika.com/s/soccer/england-premier-league";
        
        
        this.browserSessionInfo = async (page, url) => {
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
            function addArray(...arrays) {
                let newArray = [];
                for (let i = 0; i < arrays.length; i++) {
                    newArray.push(arrays[i]);
                }
                return newArray;
            }   
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
        };
        this.opponents = async (sessionData) => {
            let rivals = sessionData[1];
            if (rivals.length === 0) {
                throw new Error("Selector for opponents not found");
            } else {
                let adversaries = [];
                for (let i = 0; i < rivals.length; i += 2) {
                    let opponents = {};
                    opponents.home = rivals[i];
                    opponents.away = rivals[i + 1];
                    adversaries.push(opponents);
                }
                return adversaries;
            }
        };

        this.sportpesaOdds = async (sessionData) => {
            let odds = sessionData[2];
            if (odds.length === 0) {
                throw new Error("Selector for sportpesaOdds not found");
            } else {
                let probabilities = [];
                for (let i = 0; i < odds.length; i += 10) {
                    let chance = {};
                    chance["Home"] = odds[i];
                    chance["Draw"] = odds[i + 1];
                    chance["Away"] = odds[i + 2];
                    chance["1X"] = odds[i + 3];
                    chance["X2"] = odds[i + 4];
                    chance["12"] = odds[i + 5];
                    chance["O2.5"] = odds[i + 6];
                    chance["U2.5"] = odds[i + 7];
                    chance["GG"] = odds[i + 8];
                    chance["NGG"] = odds[i + 9];
                    probabilities.push(chance);
                }
                return probabilities;
            }
        };
        this.betwayLinks = async function(teams) {
            let links = teams.map((team) => {
                let home = team.home.toLowerCase();
                let away = team.away.toLowerCase();
                switch(home) {
                    case "manchester city":
                        home = "man_city"
                        break;
                    case "manchester utd":
                        home = "man_utd"
                        break;
                    case "aston villa":
                    case "west ham":
                    case "crystal palace":
                        home = home.split(" ").join("_");
                        break;
                    case "norwich city":
                        home = "norwich"
                        break;
                    case "leeds":
                        home = "leeds_united"
                        break;
                }
                switch(away) {
                    case "manchester city":
                        away = "man_city"
                        break;
                    case "manchester utd":
                        away = "man_utd"
                        break;
                    case "aston villa":
                    case "west ham":
                    case "crystal palace":
                        away = away.split(" ").join("_");
                        break;
                    case "norwich city":
                        away = "norwich"
                        break;
                    case "leeds":
                        away = "leeds_united"
                        break;
                }

                return `${this.betwayURL}${home}-v-${away}`;
            });
            return links;
        }
        this.betwayRawOdds = async (page, links) => {
            let rawOdds = [];
            for await (let link of links) {
                await page.goto(link, {timeout: 0, waitUntil: [ "domcontentloaded", "networkidle2"]});
                let pageOdds = await page.$$eval("div.outcome-pricedecimal", odds => {
                    return odds.map(odd => odd.innerText.trim());
                });
                rawOdds.push(pageOdds);
              }
            
            return rawOdds;
        }
        this.betwayOdds = async (odds) => {
            let betwayOdds = [];
            for (let i = 0; i < odds.length; i++) {
                let currentPageOdds = [];
                for (let j = 0; j < odds[i].length; j+=23) {
                    let chance = {};
                    chance["Home"] = odds[i][j];
                    chance["Draw"] = odds[i][j+1];
                    chance["Away"] = odds[i][j+2];
                    chance["1X"] = odds[i][j+3];
                    chance["X2"] = odds[i][j+4];
                    chance["12"] = odds[i][j+5];
                    chance["O0.5"] = odds[i][j+6];
                    chance["U0.5"] = odds[i][j+7];
                    chance["O1.5"] = odds[i][j+8];
                    chance["U1.5"] = odds[i][j+9];
                    chance["O2.5"] = odds[i][j+10];
                    chance["U2.5"] = odds[i][j+11];
                    chance["O3.5"] = odds[i][j+12];
                    chance["U3.5"] = odds[i][j+13];
                    chance["O4.5"] = odds[i][j+14];
                    chance["U4.5"] = odds[i][j+15];
                    chance["O5.5"] = odds[i][j+16];
                    chance["U5.5"] = odds[i][j+17];
                    chance["GG"] = odds[i][j+18];
                    chance["NGG"] = odds[i][j+19];
                    chance["1G"] = odds[i][j+20];
                    chance["N1G"] = odds[i][j+21];
                    chance["2G"] = odds[i][j+22];
                    currentPageOdds.push(chance);      
                }
                betwayOdds.push(currentPageOdds);
              }
            return betwayOdds;
        }

        this.events = async () => {
            try {
                const browser = await puppeteer.launch();
                let url = this.sportpesaURL;
                const page = await browser.newPage();
                
                let sessionData = await this.browserSessionInfo(page, url);
                let IDs = await this.IDs(sessionData);
                let adversaries = await this.opponents(sessionData);
                let sportpesaOdds = await this.sportpesaOdds(sessionData);
                let links = await this.betwayLinks(adversaries);
                let rawOdds = await this.betwayRawOdds(page, links);
                let betwayOdds = await this.betwayOdds(rawOdds);
                await browser.close();
                
                let data = async () => {
                    let data = [];
                    for (let i = 0; i < IDs.length; i++) {
                        let events = {};
                        events["Game Id"] = IDs[i];
                        events["Opponents"] = adversaries[i];
                        events["sportpesaOdds"] = sportpesaOdds[i];
                        events["betwayOdds"] = betwayOdds[i][0];
                        data.push(events);
                    }
                    return JSON.stringify(data, null, 2);
                };
                return await data();
            } catch (err) {
                console.error(err);
            }    
        }
    }
