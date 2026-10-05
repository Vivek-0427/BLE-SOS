// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA-qtVS7mHmCs8x96Ob2S6WDca7OEeIOi8",
  authDomain: "decentralized-sos-system.firebaseapp.com",
  projectId: "decentralized-sos-system",
  storageBucket: "decentralized-sos-system.firebasestorage.app",
  messagingSenderId: "864279006639",
  appId: "1:864279006639:web:c30b6fc055f637949ef35a",
  measurementId: "G-7YRJ832E28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };