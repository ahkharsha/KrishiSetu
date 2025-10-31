const { ethers } = require("hardhat");
const admin = require("firebase-admin");
const { setInterval } = require("timers/promises");

// Initialize Firebase
const serviceAccount = require("./service-account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL,
});

// Configuration
// const POLL_INTERVAL = 3600000; // 1 hour = 60 mins × 60 secs × 1000 ms
const POLL_INTERVAL = 20000; // 20 seconds
const CONTRACT_ADDRESS = "0xA79974A617cFD0658bCedD0821A46255d5Df57c9";
const MAX_RETRIES = 1; // Increase from 1 to 3 for better reliability
// const MAX_RETRIES = 3; // Increase from 1 to 3 for better reliability
const GAS_LIMIT = 1000000; // Increased gas limit

async function processDevice(contract, deviceId, deviceData, attempt = 1) {
  console.log(`\n📡 [Attempt ${attempt}] Processing ${deviceId}`);
  console.log('📊 Raw Data:', JSON.stringify({
    moisture: deviceData.moisture,
    temperature: deviceData.temperature,
    humidity: deviceData.humidity,
    status: deviceData.status,
    timestamp: new Date(deviceData.timestamp).toISOString()
  }, null, 2));

  try {
    // Get fresh nonce for each transaction attempt
    const nonce = await contract.runner.provider.getTransactionCount(
      contract.runner.address,
      'pending' // Include pending transactions in nonce calculation
    );

    const tx = await contract.recordSensorData(
      deviceId,
      Math.floor(deviceData.moisture),
      Math.floor(parseFloat(deviceData.temperature) * 100), // Convert to integer with 2 decimal precision
      Math.floor(parseFloat(deviceData.humidity) * 100),    // Convert to integer with 2 decimal precision
      deviceData.status,
      deviceData.local_date,
      deviceData.local_time,
      deviceData.timestamp,
      { 
        gasLimit: GAS_LIMIT,
        nonce: nonce
      }
    );

    console.log(`⌛ Waiting for transaction confirmation...`);
    await tx.wait(); // Wait for transaction to be mined
    console.log(`✅ Success! TX Hash: ${tx.hash}`);
    return true;
  } catch (error) {
    console.log(`❌ Attempt ${attempt} failed: ${error.reason || error.message}`);
    
    if (attempt < MAX_RETRIES) {
      const delay = 2000 * attempt; // Exponential backoff
      console.log(`⏳ Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return processDevice(contract, deviceId, deviceData, attempt + 1);
    }
    return false;
  }
}

async function pollDevices() {
  const startTime = Date.now();
  console.log(`\n🔄 [${new Date().toISOString()}] Polling devices...`);

  try {
    const KrishiSetu = await ethers.getContractFactory("KrishiSetu");
    const contract = await KrishiSetu.attach(CONTRACT_ADDRESS);
    const db = admin.database();

    const snapshot = await db.ref('sensor_data').once('value').catch(err => {
      console.log(`🔥 Firebase error: ${err.message}`);
      return null;
    });

    if (!snapshot || !snapshot.exists()) {
      console.log("⚠️ No devices found in Firebase");
      return;
    }

    const devices = Object.entries(snapshot.val());
    let successCount = 0;
    
    // Process devices sequentially to avoid nonce conflicts
    for (const [deviceId, data] of devices) {
      const result = await processDevice(contract, deviceId, data);
      if (result) successCount++;
      
      // Small delay between device processing (optional)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🏁 Completed in ${((Date.now() - startTime)/1000).toFixed(2)}s`);
    console.log(`   Success: ${successCount}, Failed: ${devices.length - successCount}`);
  } catch (error) {
    console.log(`⛔ Polling error: ${error.message}`);
  }
}

async function main() {
  console.log(`
   █████╗ ███████╗██████╗ ██╗ ██████╗██████╗  ██████╗ ██████╗ 
  ██╔══██╗██╔════╝██╔══██╗██║██╔════╝██╔══██╗██╔═══██╗██╔══██╗
  ███████║█████╗  ██████╔╝██║██║     ██████╔╝██║   ██║██████╔╝
  ██╔══██║██╔══╝  ██╔══██╗██║██║     ██╔══██╗██║   ██║██╔═══╝ 
  ██║  ██║██║     ██║  ██║██║╚██████╗██║  ██║╚██████╔╝██║     
  ╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     
  ██████╗  █████╗  ██████╗ 
  ██╔══██╗██╔══██╗██╔═══██╗
  ██║  ██║███████║██║   ██║
  ██║  ██║██╔══██║██║   ██║
  ██████╔╝██║  ██║╚██████╔╝
  ╚═════╝ ╚═╝  ╚═╝ ══════╝ 
  `);
  console.log('🚀 Starting Firebase-to-Blockchain Sync');
  console.log(`⏳ Polling every ${POLL_INTERVAL/1000} seconds (Press Ctrl+C to stop)\n`);

  try {
    // Initial poll
    await pollDevices();
    
    // Periodic polling
    for await (const _ of setInterval(POLL_INTERVAL)) {
      await pollDevices();
    }
  } catch (err) {
    console.log(`⛔ Critical error: ${err.message}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log("\n🛑 Received shutdown signal");
  console.log('👋 Sync service stopped');
  process.exit(0);
});

main();