import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Save.module.css";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, setDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDc1iS4NX2um7sqJuYRSll9Il_7V6g6LsE",
  authDomain: "graduatinproject.firebaseapp.com",
  projectId: "graduatinproject",
  storageBucket: "graduatinproject.appspot.com",
  messagingSenderId: "361149223809",
  appId: "1:361149223809:web:58467e248f81422f97ce80",
  measurementId: "G-NRG6TMTB8Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SavedMessages = () => {
  const navigate = useNavigate();
  const [savedMessages, setSavedMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const messagesCollection = collection(db, "messages");
      const messageSnapshot = await getDocs(messagesCollection);
      const messagesList = messageSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedMessages(messagesList);
    };

    fetchMessages();
  }, []);

  const handleDeleteMessage = async (id) => {
    // حذف الرسالة من Firebase
    await deleteDoc(doc(db, "messages", id));
    setSavedMessages(savedMessages.filter(msg => msg.id !== id));
  };

  const handleClearAllMessages = async () => {
    for (const msg of savedMessages) {
      await deleteDoc(doc(db, "messages", msg.id));
    }
    setSavedMessages([]);
  };

  return (
    <div className={styles.pageContainer}>
      <nav className={styles.navbar}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>Logo</h1>
        <ul className={styles.nav_links}>
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/reminder")}>Reminder</li>
          <li onClick={() => navigate("/plan")}>Plan & Bay Chart</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
        </ul>
      </nav>
      <h2 className={styles.title}>Saved Messages</h2>
      <div className={styles.messageTable}>
        {savedMessages.length > 0 ? (
          savedMessages.map((msg) => (
            <div key={msg.id} className={styles.messageRow}>
              <p className={styles.messageText}>{msg.text}</p>
              <div className={styles.iconContainer}>
                <button onClick={() => handleDeleteMessage(msg.id)} className={styles.deleteButton}>
                  <i className="fas fa-trash"></i>
                </button>
                <button className={styles.favouriteButton}>
                  <i className="fas fa-heart"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noMessages}>No saved messages yet.</p>
        )}
      </div>
      <div className={styles.buttonContainer}>
        <button className={styles.backButton} onClick={() => navigate("/chatbot")}>
          Back to Home
        </button>
        <button className={styles.clearButton} onClick={handleClearAllMessages}>
          Clear All Messages
        </button>
      </div>
    </div>
  );
};

export default SavedMessages;