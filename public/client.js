const apiURL = '/prices';

const $trading = document.getElementById('trading');
const $myDai = document.getElementById('myDai');
const $risk = document.getElementById('risk');

const ctx = document.getElementById('history').getContext('2d');

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
    "ZRX",
    "SNX"
];
let pricesGraph = [];

let arbs = false;
let ALLPRICES, history;

async function getAllPrices() {
    let allPrices = await fetch(apiURL, {
        method: 'GET',
    }).then(res => res.json())
        .then(allPrices => {
            ALLPRICES = allPrices;
            graph(allPrices);
            return allPrices; 
        });

    return await allPrices;
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




//Graph

function graph(allPrices) {
    setTimeout(() => {
        prepareHistoryData(allPrices);
        getBuyPrices();
        drawHistory();
    }, 1000);
}
let buyPrice;
function prepareHistoryData(_prices) {
    console.log(ALLPRICES.length);
    for(let j = 0; j < ALLPRICES.length; j++){
        pricesGraph[j] = []; 
        for(let i = 0; i < tokens.length; i++) {
            //console.log(_prices)
            
            pricesGraph[j][i] = {
                buy: _prices[j].prices[i][0],
                sell: _prices[j].prices[i][2]
            }
        }
    }
    
    //console.log(pricesGraph);
    
}


function getBuyPrices() {
    let buy = [];
    for(let i = 0; i < ALLPRICES.length; i++){

        let that = pricesGraph[i][active].buy
        buy[i] = that['val']
        //console.log(buy[i]);
    }
    buyPrice = buy;
    console.log(buy);
    return buy;
}
function drawHistory() {
    history = new Chart(ctx, {
        type: 'line',
        data: {
            
            datasets: [{
                label: 'Price',
                data: buyPrice,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',

                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

