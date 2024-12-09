import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";  // استيراد Firestore

const firebaseConfig = {
  apiKey: "AIzaSyDc1iS4NX2um7sqJuYRSll9Il_7V6g6LsE",
  authDomain: "graduatinproject.firebaseapp.com",
  projectId: "graduatinproject",
  storageBucket: "graduatinproject.appspot.com",  // تأكد من صحة الـ storageBucket
  messagingSenderId: "361149223809",
  appId: "1:361149223809:web:58467e248f81422f97ce80",
  measurementId: "G-NRG6TMTB8Q",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const db = getFirestore(app);  // تهيئة Firestore

export { auth, googleProvider, facebookProvider, db };  // تصدير auth و db و المزودين
