
const express = require('express');
const app = express();
const Web3 = require('web3');
const web3 = new Web3('https://mainnet.infura.io/v3/d0c195c7f8e942b6af9787d9321cd789');
const dai = '0x6b175474e89094c44da98b954eedeac495271d0f';

var cors = require('cors');
app.use(cors({credentials: true, origin: '*'}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
const abi = require('./abi.json');
const orAbi = abi.orFeed;
const flaAbi = abi.flash;



const PORT = 5000;
const server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));




const contractOrfFeed = '0x8316B082621CFedAB95bf4a44a1d4B64a6ffc336';
var orContract = new web3.eth.Contract(orAbi, contractOrfFeed);

const contractFlash = '0xDDeD338E716D7E395f0a9489B66e1F8d79f667f7';
var flash = new web3.eth.Contract(flaAbi, contractFlash);



//Database MongoDB
const monk  = require('monk');
const dbUrl = `localhost/kyberuniswap`;
const db = monk(dbUrl);

const dbPrices = db.get('onlyPrices');


let trading = false;
let daiCapital = 10;
let risk = 0.1;

let arbs = false;
let msgArb = 'No arbs right now';
let arbObj = {};


let PRICES = [];
let exch = [
    "BUY-UNISWAP-EXCHANGE",
    "SELL-UNISWAP-EXCHANGE",
    "SELL-KYBER-EXCHANGE"
];
let tokens = [
    "BTC",
    "ETH",
    "MKR",
    "PAX",
    "REP",
    "ZRX",
    "SNX"
];
let main = "DAI";
let amount = "100";
let buf = 1.02;

setPrices();
function setPrices(){
    //console.log(this.prices);
   
    let pricesNow = [];
    for(let i = 0; i < 7; i++){
        pricesNow[i] = [];
        
        for(let j = 0; j < 3; j++){
            //console.log(this.prices);
            orContract.methods.getExchangeRate(tokens[i], main, exch[j], amount).call({
                'from': '0xda5663d6ff4Fe38164Cd1726766F3Dc7cb8BF553'
              
            },function(error, data){

                let obj = parseInt(data);
                pricesNow[i][j] = obj;
                //console.log(obj);
                PRICES = pricesNow;
                

                if(i == 6 && j == 2){
                    //console.log(PRICES);
                    checkArbs();
                    insertDb(PRICES);
                }
            })
        }
        
    }

    

}

function insertDb(data) {

    let newPrices = {
        prices: data,
        date: new Date()
    };
    dbPrices
    .insert(newPrices)
    .then(createdItem => console.log(createdItem));
}

function checkArbs() {
    
    for(let i = 0; i < 7; i++){
        if(PRICES[i][0] * buf < PRICES[i][2]) {
            if(PRICES[i][2] != 0 && PRICES[i][2] != undefined){
                let marge = PRICES[i][2]/PRICES[i][0];
                msgArb = 'Arb Opportunity SELL KYBER '+ tokens[i] + "  Marge " + marge
                console.log(msgArb);
                arbs = true;
                arbObj = {
                    token: tokens[i],
                    marge: marge,
                    msg: 'Buy Uniswap Sell Kyber'
                }
                if(trading){
                    let exposure =  getAmount(marge);
                    makeArbTrade(exposure, tokens[i], "UNISWAP", "KYBER", "KYBER")

                }
            }
        } else {
            arbs = false;
            arbObj = {};
            msgArb = 'No Arbs right now';
        }
    }
    if(!arbs) {
        
        console.log('No Arbs right now..')
    }
}

function makeArbTrade(_amount, _mToken, _ex0, _ex1, _ex2) {

    flash.methods.arbTrade(_amount, _mToken, _ex0, _ex1, _ex2).call({
        'from': '0xda5663d6ff4Fe38164Cd1726766F3Dc7cb8BF553'
    },(err, data) => {
        let da = data;
        console.log(da);
    
    })

}

function getAmount(marge){

    let profability = ((marge -1) * 5) +1;
    let tradeAmount = daiCapital * risk * profability;
    return tradeAmount;
}





//Routes

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/prices', (req, res) => {
    dbPrices
        .find()
        .then(prices => {
            res.json(prices);
        })
});

app.post('/info', (req, res) => {
    
    let state = req.body;
    
    trading = state.trading;
    risk = state.risk;
    

    let obj = {
        trading, daiCapital, risk
    }
    res.json(obj);
})

app.get('/info', (req, res) => {
    let obj = {
        trading, daiCapital, risk
    }
    res.json(obj);
})
app.get('/arbs', (req, res) => {
    let obj = {
        arbs, arbObj, msgArb
    }
    res.json(obj);
})