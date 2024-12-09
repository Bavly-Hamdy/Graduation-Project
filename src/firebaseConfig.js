// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDc1iS4NX2um7sqJuYRSll9Il_7V6g6LsE",
  authDomain: "graduatinproject.firebaseapp.com",
  projectId: "graduatinproject",
  storageBucket: "graduatinproject.firebasestorage.app",
  messagingSenderId: "361149223809",
  appId: "1:361149223809:web:58467e248f81422f97ce80",
  measurementId: "G-NRG6TMTB8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

// Setup providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { auth, googleProvider, facebookProvider };
