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
    //console.log(obj[1].sites) 

    // Apply formula to get only games that follow criteria 
    let game

    for (let i=0; i<obj.length; i++) {
        game = obj[i].teams
        betSites = obj[i].sites
        if (soccerTeams.includes(obj[i].sport_key)){
            //console.log("There are upcoming soccer games")
            for (j in betSites) {
                //console.log("Checking all betting sites")
                if (betSites[j].site_nice == "Pinnacle") {
                    //console.log("Found Pinnacle")
                    if (betSites[j].odds.h2h[2]>=minTieOdds && betSites[j].odds.h2h[2]<=maxTieOdds 
                        && Math.abs(betSites[j].odds.h2h[0]-betSites[j].odds.h2h[1])<maxDifferenceOdds) {
                            //console.log(game+" is worth betting on!")
                            goodBetTeams.push(game)
                        } else {
                            //console.log(game+" is NOT worth betting on.")
                        }
                        break
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
        //console.log(obj[1].sites[1].odds.totals.points) 

        // Apply formula to get only games that follow criteria 
        let totalGame
        let finalBetTeams = []

        for (let i=0; i<obj.length; i++) {
            totalGame = obj[i].teams
            betSites = obj[i].sites
            if (soccerTeams.includes(obj[i].sport_key)){
                //console.log("There are upcoming soccer games")
                for (j in betSites) {
                    //console.log("Checking all betting sites")
                    if (betSites[j].site_nice == "Pinnacle") {
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
                    } 
                }
            }
            //console.log("There are no upcoming soccer games")
        }
        if (finalBetTeams>0){
            console.log("Teams worth betting on (H2H & Totals) are: "+finalBetTeams)
        } else {
            console.log("No games worth betting on...")
        }
        console.log("Done everything")
    })
}
