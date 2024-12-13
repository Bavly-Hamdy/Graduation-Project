import { initializeApp } from "firebase/app"; // Initialize Firebase app first
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";  // For Realtime Database

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDc1iS4NX2um7sqJuYRSll9Il_7V6g6LsE",
  authDomain: "graduatinproject.firebaseapp.com",
  projectId: "graduatinproject",
  storageBucket: "graduatinproject.appspot.com",
  messagingSenderId: "361149223809",
  appId: "1:361149223809:web:58467e248f81422f97ce80",
  measurementId: "G-NRG6TMTB8Q",
  databaseURL: "https://graduatinproject-default-rtdb.europe-west1.firebasedatabase.app", // Add this line
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Now initialize Firebase services (auth, firestore, etc.)
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const db = getFirestore(app); // Firestore
const realTimeDb = getDatabase(app);  // Realtime Database

export { auth, googleProvider, facebookProvider, db, realTimeDb };
