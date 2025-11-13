import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDgabsawS_4WuQOXFyV6t4Ryj2SRkfMSks",
  appId: "1:980297191797:web:89b0379b6189f28640833c",
  messagingSenderId: "980297191797",
  projectId: "krishisetu-dao",
  databaseURL: "https://krishisetu-dao-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const rtdb = getDatabase(app);
const db = getFirestore(app);

export { rtdb, db };