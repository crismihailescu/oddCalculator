const axios = require('axios')

// An api key is emailed to you when you sign up to a plan
const api_key = 'bfaef0d743a79a41faf334cab37e4b67'


// To get odds for a sepcific sport, use the sport key from the list below
//   or set sport to "sport_key" to see live and upcoming across all sports
const superligaArgentina = "soccer_argentina_primera_division"
const australiaA_League = "soccer_australia_aleague"
const belgiumFirstDevision = "soccer_belgium_first_div"
const denmarkSuperliga = "soccer_denmark_superliga"
const eflChampionship_UK = "soccer_efl_champ"
const eflLeague1_UK = "soccer_england_league1"
const eflLeague2_UK = "soccer_england_league2"
const eplUK = "soccer_epl"
const faCupUK = "soccer_fa_cup"
const ligue1France = "soccer_france_ligue_one"
const ligue2France = "soccer_france_ligue_two"
const bundesligaGermany = "soccer_germany_bundesliga"
const bundesliga2Germany = "soccer_germany_bundesliga2"
const seriaAItaly = "soccer_italy_serie_a"
const seriaBItaly = "soccer_italy_serie_b"
const ligaMexico = "soccer_mexico_ligamx"
const dutchSoccer = "soccer_netherlands_eredivisie"
const norwegianSoccer = "soccer_norway_eliteserien"
const portugeseSoccer = "soccer_portugal_primeira_liga"
const russianSoccer = "soccer_russia_premier_league"
const laLigaSpain = "soccer_spain_la_liga"
const laLiga2Spain = "soccer_spain_segunda_division"
const splScotland = "soccer_spl"
const swedishSoccer = "soccer_sweden_allsvenskan"
const swedishSuperettan = "soccer_sweden_superettan"
const turkishSuperLeague = "soccer_turkey_super_league"
const UEFAChampionLeague = "soccer_uefa_champs_league"
const UEFAEurope = "soccer_uefa_europa_league"
const MLS = "soccer_usa_mls"
const Korea = "soccer_korea_kleague1"

// List of all soccer teams to remove non-soccer teams
let soccerTeams = [superligaArgentina, australiaA_League, belgiumFirstDevision, denmarkSuperliga, eflChampionship_UK,
                eflLeague1_UK, eflLeague2_UK, eplUK, faCupUK, ligue1France, ligue2France, bundesligaGermany, bundesliga2Germany,
                seriaBItaly, ligaMexico, dutchSoccer, norwegianSoccer, portugeseSoccer, russianSoccer, laLiga2Spain, laLigaSpain,
                splScotland, swedishSoccer, swedishSuperettan, turkishSuperLeague, UEFAChampionLeague, UEFAEurope, MLS, seriaAItaly,
                Korea]

// Find all games happening tomorrow
let upcoming = "upcoming"

// Key for API (Variable)
let sport_key = upcoming

const maxTotalOdds = 1.7
const maxDifferenceOdds = 1
const maxTieOdds = 3.45
const minTieOdds = 2.7

let goodBetTeams = []

axios.get('https://api.the-odds-api.com/v3/odds', {
    params: {
        api_key: api_key,
        sport: sport_key,
        region: 'eu', // uk | us | eu | au
        mkt: 'h2h' // h2h | spreads | totals
    }
})
.then(response => {
    // Print the number of events recieved (Number of games)
    console.log(`Successfully got ${response.data.data.length} events`)

    // To print the JSON text in its entirety (Not needed)
    //console.log(JSON.stringify(response.data.data))
    
    // Print all events 
    obj = response.data.data
    console.log(obj)

    // Check remaining usage 
    console.log('Remaining requests',response.headers['x-requests-remaining'])
    console.log('Used requests',response.headers['x-requests-used'])
})
.catch(error => {
    console.log('Error status', error.response.status)
    console.log(error.response.data)
})
.finally(function print() {
    console.log("Started H2H Calculation")

    // Test function
    // console.log(obj[1].sites[0]) 
    // console.log(obj[1].sites[1]) 
    // console.log(obj[1].sites[2]) 
    // console.log(obj[1].sites[3]) 
    // console.log(obj[1].sites[4]) 
    // console.log(obj[1].sites[5]) 

    // Apply formula to get only games that follow criteria 
    let games
    let avgTie = 0
    let avgDifference = 0
    let pinnacleExist = false
    let betSiteMinusTie = 0
    let betSiteMinusDiff = 0

    for (let i=0; i<obj.length; i++) {
        game = obj[i].teams
        betSites = obj[i].sites
        betSiteMinusDiff = 0
        betSiteMinusTie = 0
        avgTie = 0
        avgDifference = 0
        pinnacleExist = false
        if (soccerTeams.includes(obj[i].sport_key)){
            //console.log("There are upcoming soccer games")
            for (j in betSites) {
                //console.log("Checking all betting sites")
                if (betSites[j].site_nice == "Pinnacle") {
                    console.log("Found Pinnacle odds for "+game+" with Difference: "+Math.abs(betSites[j].odds.h2h[0]-betSites[j].odds.h2h[1])+". Diff: "+betSites[j].odds.h2h[2])
                    pinnacleExist = true
                    if (betSites[j].odds.h2h[2]>=minTieOdds && betSites[j].odds.h2h[2]<=maxTieOdds 
                        && Math.abs(betSites[j].odds.h2h[0]-betSites[j].odds.h2h[1])<maxDifferenceOdds) {
                            //console.log("Added Pinnacle odds for \""+game+"\". Difference: "+Math.abs(betSites[j].odds.h2h[0]-betSites[j].odds.h2h[1])+". Tie: "+betSites[j].odds.h2h[2])
                            goodBetTeams.push(game)
                        } else {
                            //console.log(game+" is NOT worth betting on.")
                        }
                        break
                } else {
                    //console.log("No Pinnacle")
                    // Average out all the other odds
                    if (isNaN(betSites[j].odds.h2h[2])) {
                        avgTie += 0
                        betSiteMinusTie++
                    } else {
                        //console.log("Before tie: "+avgTie)
                        avgTie += betSites[j].odds.h2h[2]
                        //console.log("After tie: "+avgTie)
                    }
                    if (isNaN(Math.abs(betSites[j].odds.h2h[0]-betSites[j].odds.h2h[1]))) {
                        avgDifference += 0
                        betSiteMinusDiff++
                    } else {
                        //console.log("Before diff: "+avgDifference)
                        avgDifference += Math.abs(betSites[j].odds.h2h[0]-betSites[j].odds.h2h[1])
                        //console.log("After diff: "+avgDifference)
                    }
                } 
            }
            if (!pinnacleExist) {
                //console.log("Final Tie: "+avgTie+" Diff: "+avgDifference)
                avgDifference = avgDifference/(obj[i].sites_count-betSiteMinusDiff)
                avgTie = avgTie/(obj[i].sites_count-betSiteMinusTie)
                //console.log("Site count: "+obj[i].sites_count)
                console.log("Found other site averages for \""+game+"\". Difference: "+avgDifference+". Tie: "+avgTie+".")
                //console.log("Number of tie sites subtracted: "+betSiteMinusTie+". Difference sites subtracted: "+betSiteMinusDiff)
                if (avgDifference<maxDifferenceOdds && avgTie>=minTieOdds && avgTie<=maxTieOdds){
                    goodBetTeams.push(game)
                    //console.log("Added other site game "+game)
                }
            }
        }
        //console.log("There are no upcoming soccer games")
    }
    console.log("Teams worth betting on for H2H are: "+goodBetTeams)
    if (goodBetTeams.length<=0){
        throw new Error("No H2H available, not running Totals")
    } else {
        console.log("Done H2H")
        runTotals()
    }
})


// Function for finding totals if H2H exists

function runTotals(){
    // New API Call to test Totals
    axios.get('https://api.the-odds-api.com/v3/odds', {
        params: {
            api_key: api_key,
            sport: sport_key,
            region: 'eu', // uk | us | eu | au
            mkt: 'totals' // h2h | spreads | totals
        }
    })
    .then(response => {
        // Print the number of events recieved (Number of games)
        //console.log(`Successfully got ${response.data.data.length} events`)

        // To print the JSON text in its entirety (Not needed)
        //console.log(JSON.stringify(response.data.data))
        
        // Set obj to the JSON List
        obj = response.data.data

        // Print all events 
        //console.log(obj)

        // Check remaining usage 
        //console.log('Remaining requests',response.headers['x-requests-remaining'])
        //console.log('Used requests',response.headers['x-requests-used'])
    })
    .catch(error => {
        console.log('Error status', error.response.status)
        console.log(error.response.data)
    })
    .finally(function print() {
        console.log("Started Totals Calculation")
        // Test function
        //console.log(obj[2].sites[0].odds.totals) 
        // console.log(obj[2].sites[1].odds.totals.points) 
        // console.log(obj[2].sites[2].odds.totals.points) 
        // console.log(obj[2].sites[3].odds.totals.points) 
        // console.log(obj[2].sites[4].odds.totals.points) 

        // Apply formula to get only games that follow criteria 
        let totalGame
        let finalBetTeams = []

        let avgTotalOdds = 0
        let betSiteMinus = 0
        let pinnacleExistTotals = false

        for (let i=0; i<obj.length; i++) {
            totalGame = obj[i].teams
            betSites = obj[i].sites
            betSiteMinus = 0
            avgTotalOdds = 0
            pinnacleExistTotals = false
            if (soccerTeams.includes(obj[i].sport_key)){
                //console.log("There are upcoming soccer games")
                for (j in betSites) {
                    //console.log("Checking all betting sites")
                    if (betSites[j].site_nice == "Pinnacle") {
                        pinnacleExistTotals = true
                        //console.log("Found Pinnacle")
                        if (betSites[j].odds.totals.points[1]==2.5 && betSites[j].odds.totals.position[1]=="under" 
                        && betSites[j].odds.totals.odds[1]<=maxTotalOdds) {
                            if (goodBetTeams.includes(totalGame)){
                                //console.log("This game is worth betting on: "+totalGame)
                                finalBetTeams.push(totalGame)
                            } else {
                                //console.log("This ("+totalGame+") team is NOT worth betting on")
                            }
                        }
                        break
                    } else {
                        //console.log("No Pinnacle")
                        // Average out all the other odds
                        if (isNaN(betSites[j].odds.totals.odds[1]) || betSites[j].odds.totals.points[1]!=2.5 || betSites[j].odds.totals.position[1]!="under" ) {
                            avgTotalOdds += 0
                            betSiteMinus++
                        } else {
                            avgTotalOdds += betSites[j].odds.totals.odds[1]
                        }
                    } 
                }
                if (!pinnacleExistTotals) {
                    avgTotalOdds = avgTotalOdds/(obj[i].sites_count-betSiteMinus)
                    console.log("Found other site averages for \""+totalGame+"\". Total Odds: "+avgTotalOdds+".")
                    if (avgTotalOdds<=maxTotalOdds){
                        for (m in goodBetTeams){
                            // console.log(goodBetTeams[m][0])
                            // console.log(totalGame[0])
                            // console.log(goodBetTeams[m][1])
                            // console.log(totalGame[1])
                            if (goodBetTeams[m][0] == totalGame[0] && goodBetTeams[m][1] == totalGame[1]) {
                                finalBetTeams.push(totalGame)
                                //console.log("Added other site game "+totalGame)
                            } else {
                                //console.log(totalGame+" was not added")
                            }
                        }
                    }
                }
            }
            //console.log("There are no upcoming soccer games")
        }
        if (finalBetTeams.length>0){
            console.log("Teams worth betting on (H2H & Totals) are: "+finalBetTeams)
        } else {
            console.log("No games worth betting on...")
        }
        console.log("Done everything")
    })
}
