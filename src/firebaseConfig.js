import { initializeApp } from "firebase/app"; 
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  onValue 
} from "firebase/database";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDc1iS4NX2um7sqJuYRSll9Il_7V6g6LsE",
  authDomain: "graduatinproject.firebaseapp.com",
  projectId: "graduatinproject",
  storageBucket: "graduatinproject.appspot.com",
  messagingSenderId: "361149223809",
  appId: "1:361149223809:web:58467e248f81422f97ce80",
  measurementId: "G-NRG6TMTB8Q",
  databaseURL: "https://graduatinproject-default-rtdb.europe-west1.firebasedatabase.app", 
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const db = getFirestore(app); // Firestore Database
const realTimeDb = getDatabase(app); // Realtime Database

// Export all initialized services and Firestore helpers
export {
  auth,
  googleProvider,
  facebookProvider,
  db,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  realTimeDb,
  ref,
  set,
  push,
  onValue,
};
