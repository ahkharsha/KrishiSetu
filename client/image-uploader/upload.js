const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

// --- 1. CONFIGURATION ---

// --- 1. CONFIGURATION ---


// Use path.join to build reliable paths
// __dirname is the path to the folder this script is in (image-uploader)
const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
const LOCAL_IMAGE_PATH = path.join(__dirname, 'farm-image.jpg');

// Get your Service Account Key (DECLARED ONLY ONCE)
const serviceAccount = require(serviceAccountPath);

// Firebase Path
const FIRESTORE_COLLECTION = "farms";
const FIRESTORE_DOC = "farm1";
const FIRESTORE_SUBCOLLECTION = "devices";
const FIRESTORE_DEVICE_DOC = "device_001";

// --- 2. INITIALIZE FIREBASE ---

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Use FIRESTORE
const db = admin.firestore();

console.log("Firebase Admin initialized (Firestore).");

// --- 3. UPLOAD FUNCTION ---

async function uploadImage() {
  console.log(`Starting upload for ${LOCAL_IMAGE_PATH}...`);
  const pinataUrl = "https://api.pinata.cloud/pinning/pinFileToIPFS";

  // 1. Check if file exists
  if (!fs.existsSync(LOCAL_IMAGE_PATH)) {
    console.error(`\nError: Image file not found at ${LOCAL_IMAGE_PATH}`);
    console.error("Please make sure 'farm-image.jpg' is in the 'image-uploader' folder.");
    return;
  }

  // 2. Create the form data for Pinata
  const formData = new FormData();
  const fileStream = fs.createReadStream(LOCAL_IMAGE_PATH);
  formData.append("file", fileStream);

  try {
    // 3. Upload to Pinata (IPFS)
    const response = await axios.post(pinataUrl, formData, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
    });

    // 4. Get the IPFS Hash (CID) and create a public URL
    const ipfsHash = response.data.IpfsHash;
    const publicUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    console.log(`\nSuccess! Image pinned to IPFS: ${publicUrl}`);

    // --- 5. SAVE URL TO FIRESTORE ---
    const docRef = db.collection(FIRESTORE_COLLECTION)
                     .doc(FIRESTORE_DOC)
                     .collection(FIRESTORE_SUBCOLLECTION)
                     .doc(FIRESTORE_DEVICE_DOC);

    // Set { merge: true } so it only adds/updates these fields
    // without destroying other data in that document.
    await docRef.set({
      latest_image_url: publicUrl,
      last_uploaded_timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipfs_cid: ipfsHash 
    }, { merge: true }); 

    console.log(`Image URL saved to Firestore at: ${docRef.path}`);

  } catch (error) {
    console.error("Error during upload:", error.message);
  }
}

// --- 6. SCHEDULING ---

// Note: 12 hours * 60 min * 60 sec * 1000 ms
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

// Run the function once immediately when the script starts
console.log("Running initial IPFS upload...");
uploadImage();

// Set the script to run every 12 hours
setInterval(uploadImage, TWELVE_HOURS_MS);

console.log(`\nScript is running. Next IPFS upload in 12 hours.`);