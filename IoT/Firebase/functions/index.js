const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { ethers } = require('ethers');

admin.initializeApp();

// Initialize provider
const provider = new ethers.providers.JsonRpcProvider(
  'https://curtis.rpc.caldera.xyz/http',
  {
    chainId: 33111,
    name: 'curtis'
  }
);

const wallet = new ethers.Wallet('', provider);

const contractABI = [
  {
    "inputs": [
      {"internalType": "uint8", "name": "_cropType", "type": "uint8"},
      {"internalType": "string", "name": "_farmId", "type": "string"},
      {"internalType": "uint256", "name": "_initialSeeds", "type": "uint256"}
    ],
    "name": "sowCrop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const contractAddress = "";
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Correct scheduled function syntax
exports.processSensorData = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('UTC')
  .onRun(async (context) => {
    const db = admin.database();
    const ref = db.ref('sensorReadings');
    
    const snapshot = await ref.orderByChild('pushedToBlockchain').equalTo(false).limit(10).once('value');
    
    if (!snapshot.exists()) {
      console.log('No new sensor data to process');
      return null;
    }

    const updates = {};
    const promises = [];

    snapshot.forEach((deviceSnapshot) => {
      const deviceId = deviceSnapshot.key;
      const deviceData = deviceSnapshot.val();
      
      Object.keys(deviceData).forEach((readingKey) => {
        const reading = deviceData[readingKey];
        
        if (reading.pushedToBlockchain !== false) return;
        
        promises.push(
          contract.sowCrop(
            determineCropType(reading.soilMoisture),
            `Farm-${deviceId.substring(0, 8)}`,
            Math.floor(reading.soilMoisture / 10),
            { gasLimit: 500000 }
          )
          .then((tx) => {
            updates[`${deviceId}/${readingKey}/pushedToBlockchain`] = true;
            updates[`${deviceId}/${readingKey}/txHash`] = tx.hash;
            return tx.wait();
          })
          .catch((error) => {
            console.error(`Error processing ${deviceId}/${readingKey}:`, error);
            updates[`${deviceId}/${readingKey}/lastError`] = error.message;
          })
        );
      });
    });

    await Promise.all(promises);
    return ref.update(updates);
  });

function determineCropType(soilMoisture) {
  if (soilMoisture > 700) return 0; // MAIZE
  if (soilMoisture > 500) return 1; // RICE
  return 2; // WHEAT
}