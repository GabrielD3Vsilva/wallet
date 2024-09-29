require('dotenv').config();
const WalleteService = require('./WalletService');
const SYMBOL = process.env.SYMBOL;
const axios = require('axios');

const readLine = require('readline');

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});


let myAdress = null;

function menu(){
    setTimeout(( )=>{
        console.clear();

        if(myAdress)
            console.log(`You are logged as ${myAdress}`);
        else
            console.log('You A`rent logged!')

        console.log("1- Create Wallet");
        console.log("2- Recover Wallet");
        console.log("3- Balance");
        console.log("4- Send "+ SYMBOL);
        console.log("5- Search Tx");
        console.log("6- Find Cryptocurrency Stores"); // Nova opção
    
    
        rl.question("Choose your option: ", (answer) => {
            switch(answer) {
                case "1": createWallet(); break;
                case "2": recoverWallet(); break;
                case "3": getBalance(); break;
                case "4": sendTx(); break;
                case "5": break;
                case "6": findCryptoShops(-23.0104, -45.5593, 50); break;
                default: {
                    console.log("wrong option");
                    menu();
                }
            }
        })
    }, 1000);
}

function preMenu() {
    rl.question("Press any key to continue...", ()=>{
        menu();
    });
}

async function findCryptoShops(lat, lon, radius) {
    console.clear();
    try {
        const response = await axios.get('https://coinmap.org/api/v1/venues/');
        const stores = response.data.venues;
        const nearbyStores = stores.filter(store => {
          const distance = getDistance(lat, lon, store.lat, store.lon);
          return distance <= radius;
        });
        console.log(`Lojas que aceitam criptomoedas dentro de ${radius} km:`, nearbyStores);
    } catch (error) {
        console.error('Erro ao buscar lojas:', error);
    }
    preMenu();
    
}


function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distância em km
    return distance;
}



function createWallet() {
    console.clear();

    const myWallet = WalleteService.createWallet();
    myAdress = myWallet.address;

    console.log('Your new Wallet: ');
    console.log(myAdress);
    console.log('PK: '+ myWallet.privateKey);

    preMenu();
}

function recoverWallet(){
    console.clear();

    rl.question('what is your private key or phrase mnemonic', (pkOrMnemonic) => {
        const myWallet = WalleteService.recoverWallet(pkOrMnemonic);

        myAdress = myWallet.address;

        console.log('Your recovered wallet: ');
        console.log(myAdress);

        preMenu();
    });
}

async function getBalance(){
    console.clear();

    if(!myAdress){
        console.log('You dont have a wallet yet! ');
        return preMenu();
    }

    const { balanceInEth } = await WalleteService.getBalance(myAdress);
    console.log(`${SYMBOL} ${balanceInEth}`);

    preMenu();
}

function sendTx(){
    console.clear();

    if(!myAdress){
        console.log('You dont have a wallet yet! ');
        return preMenu();
    }

    console.log(`Your Wallet is ${myAdress}`);

    rl.question("To Wallet: ", (toWallet) => {
        if(!WalleteService.addressIsValid(toWallet)){
            console.log('Invalid Wallet');
            return preMenu();
        }

        rl.question(`Amount (in ${SYMBOL}): `, async (amountInEth) => {
            if(!amountInEth){
                console.log('Invalid amount');
                return preMenu();
            }

            const tx = WalleteService.buildTransaction(toWallet, amountInEth);

            if(!tx){
                console.log('Insufficient balance');
                return preMenu();
            }

            try{
                const txReceipt = await WalleteService.sendTransaction(tx);

                console.log('Transaction successful!');
                console.log(txReceipt);


            }catch(err){
                console.log(err);
            }

            return preMenu();
        });

        
    })
    preMenu();
}

menu();


