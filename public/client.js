


const apiURL = '/prices';


const $trading = document.getElementById('trading');
const $myDai = document.getElementById('myDai');
const $risk = document.getElementById('risk');
const $arbs = document.getElementById('arbs');
const $noArbs = document.getElementById('no-arbs');
const $targetCoin = document.getElementById('targetCoin');
const $targetExchange = document.getElementById('targetExchange');
const $active = document.getElementById('active');
const  $tokensUL = document.getElementById('tokens');
let $tokensLi = [];


const canvas = document.getElementById('history');

const ctx = canvas.getContext('2d');
let trading = false;
let myDai = 10;
let risk = 0.1;
let active = 0;
let tokens = [
    "BTC",
    "ETH",
    "MKR",
    "PAX",
    "REP",
    "ZRX"
];
let pricesGraph = [];

let arbs = false;
let ALLPRICES, history;
let aPrices = [];
let buy = [];
let sell = [];
let average = [];


$active.textContent = tokens[active];
$myDai.textContent = '10 DAI'



async function getAllPrices() {
    let AllPrices = await fetch(apiURL, {
        method: 'GET',
    }).then(res => res.json())
        .then((allPrices) =>  {
            ALLPRICES = allPrices;
            //console.log(allPrices);
            //graph(allPrices);
            
            for(let j = 0; j < allPrices.length; j++){
                aPrices[j] = [];
            }

            for(let j = 0; j < allPrices.length; j++){
                               
                
                for(let i = 0; i < tokens.length; i++) {

                    
                    aPrices[j][i] =  {
                        buy: allPrices[j].prices[i][0],
                        sell: allPrices[j].prices[i][2]
                    }
                    //console.log(aPrices[j][i]);
                    
                }
            }


            
            for(let i = 0; i < ALLPRICES.length; i++){
        
                let that = aPrices[i][active].buy
                
                buy[i] = that/100;

                let thats = aPrices[i][active].sell
                
                sell[i] = thats/100;

                average[i] = sell[i] / buy[i]
            }
            

            
            



            //console.log(buy);
            drawHistory(average);

            getArbs();

            //console.log(buy);

            return allPrices; 
        });

    return await AllPrices;
}
getAllPrices();

async function setInfo() {
    let data = {trading, risk};
    let info = await fetch('/info', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => res.json())
        .then(resp => {
            console.log(resp);
        });

    return await info;
}

//console.log(getAllPrices());

(function drawTokens() {
    for (let i = 0; i < tokens.length; i++) {
        const li = document.createElement('li');
        li.innerText = tokens[i];
        $tokensLi[i] = li;
        $tokensUL.appendChild(li);
        styleActiveToken();
        $tokensLi[i].addEventListener('click', (e) => {
            active = i;
            $active.textContent = tokens[active];
            styleActiveToken();
            prepareDraw();

        })
    }
})();


//change Settings

$trading.addEventListener('change', (event) => {
    
    trading = event.target.checked;
    console.log(trading);
    setInfo();
    
});
$risk.addEventListener('change', (event) => {
    
    risk = event.target.value / 100;
    console.log(risk);
    setInfo();
    
});

(async function getInfo() {
    let info = await fetch('info', {
        method: 'GET',
    }).then(res => res.json())
        .then(newInfo => {
            return newInfo;
            trading = newInfo.trading;
            $trading.checked = trading;
            myDai = newInfo.myDai;
            $myDai.textContent = `${myDai} DAI`
            risk = newInfo.risk;
            $risk.value = risk * 100;
        });

    return await info;
})();

getArbs();


function prepareDraw() {
    
    
    for(let i = 0; i < ALLPRICES.length; i++){
        
        let that = aPrices[i][active].buy
        
        buy[i] = that/100;

        let thats = aPrices[i][active].sell
        
        sell[i] = thats/100;

        average[i] = sell[i] / buy[i]
    }
    
    //console.log(buy);
    drawHistory(average);
}

function drawHistory(average) {
    let xLabel = [];
    for(let i =0; i < buy.length; i++) {
        xLabel[i] = i;
    }
    //console.log(buy);
    var mixedChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'SELL PRICE / BUY PRICE',
                data: average,
                backgroundColor: colors.main[1],
                // this dataset is drawn below
                order: 1
            }],
            labels: xLabel
        },
        options: { 
            legend: {
                labels: {
                    fontColor: "white",
                    fontSize: 18
                }
            },
            scales: {
                yAxes: [{
                    ticks: {
                        fontColor: "white",
                        fontSize: 18
                    }
                }],
                xAxes: [{
                    ticks: {
                        fontColor: "white",
                        fontSize: 14,
                        beginAtZero: true,
                        stepSize: 0.1
                    }
                }]
            }
        }
    });
}


function update() {
    getArbs();
    setInterval(update, 60*1000);
}

async function getArbs() {
    let Arbs = await fetch('arbs', {
        method: 'GET',
    }).then(res => res.json())
        .then((arbs) =>  {
            //console.log(arbs);
            if (arbs.arbs == true) {
                
                $noArbs.style.display = 'none';
                $arbs.style.display = 'block';

                $targetCoin.textContent = arbs.arbObj.token;
                $targetExchange.textContent = "Kyber";
                


                const whichToken = (element) => element = arbs.arbObj.token;
                let index = tokens.findIndex(whichToken);
                console.log(index, arbs.arbObj);
                active = index;
                $active.textContent = tokens[active];
                styleActiveToken()
                prepareDraw();

            } else {
                console.log('No Arbs');
                $noArbs.style.display = 'block';
                $arbs.style.display = 'none';
            }
        })
}


function styleActiveToken() {
    for(let i = 0; i < $tokensLi.length; i++){
        $tokensLi[i].id = '';
    }
    $tokensLi[active].id = 'currentToken';
}