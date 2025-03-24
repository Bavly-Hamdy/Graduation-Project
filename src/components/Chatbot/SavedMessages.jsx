import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // Import Navbar
import styles from "./Save.module.css";
import { realTimeDb, auth } from "../../firebaseConfig"; // Import realTimeDb and auth
import { ref, onValue, set, remove } from "firebase/database"; // Import Firebase Realtime Database functions
import { onAuthStateChanged } from "firebase/auth";

const SavedMessages = () => {
  const navigate = useNavigate();
  const [savedMessages, setSavedMessages] = useState([]);
  const [user, setUser] = useState(null); // Track the authenticated user
  const [userId, setUserId] = useState(null); // Track the user's unique ID

  // Fetch the authenticated user and their unique ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid); // Set the user's unique ID
        console.log("User logged in:", currentUser.uid);
      } else {
        setUser(null);
        setUserId(null);
        console.log("No user logged in");
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch saved messages from Firebase Realtime Database
  useEffect(() => {
    if (!userId) return; // Skip if no user is logged in

    const messagesRef = ref(realTimeDb, `Users/${userId}/savedMessages`); // Reference to the user's savedMessages node
    console.log("Fetching saved messages from Firebase...");

    // Listen for changes in the database
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Data from Firebase:", data);
      if (data) {
        const messagesArray = Object.keys(data).map((key) => ({
          id: key, // Use the unique ID from Firebase
          ...data[key],
        }));
        setSavedMessages(messagesArray);
      } else {
        setSavedMessages([]); // If no messages exist, set an empty array
      }
    });
  }, [userId]);

  // Delete a saved message
  const handleDeleteMessage = (messageId) => {
    if (!userId) return; // Skip if no user is logged in

    const messageRef = ref(realTimeDb, `Users/${userId}/savedMessages/${messageId}`);
    console.log("Deleting message:", messageId);
    remove(messageRef)
      .then(() => {
        console.log("Message deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
      });
  };

  // Toggle favourite status of a message
  const handleFavouriteMessage = (messageId, isFavourite) => {
    if (!userId) return; // Skip if no user is logged in

    const messageRef = ref(realTimeDb, `Users/${userId}/savedMessages/${messageId}`);
    console.log("Toggling favourite status for message:", messageId);
    set(messageRef, { ...savedMessages.find((msg) => msg.id === messageId), favourite: !isFavourite })
      .then(() => {
        console.log("Message favourite status updated");
      })
      .catch((error) => {
        console.error("Error updating favourite status:", error);
      });
  };

  // Clear all saved messages
  const handleClearAllMessages = () => {
    if (!userId) return; // Skip if no user is logged in

    const messagesRef = ref(realTimeDb, `Users/${userId}/savedMessages`);
    console.log("Clearing all messages");
    remove(messagesRef)
      .then(() => {
        console.log("All messages cleared successfully");
      })
      .catch((error) => {
        console.error("Error clearing messages:", error);
      });
  };

  return (
    <div>
      {/* Use the Navbar component */}
      <Navbar user={user} />

      <div className={styles.pageContainer}>
        <h2 className={styles.title}>Saved Messages</h2>
        {savedMessages.length > 0 ? (
          <div className={styles.messageTable}>
            <div className={styles.tableHeader}>
              <div className={styles.columnHeader}>Saved Messages</div>
              <div className={styles.columnHeader}>Actions</div>
            </div>
            {savedMessages.map((msg) => (
              <div key={msg.id} className={styles.messageRow}>
                <div className={styles.messageText}>{msg.text}</div>
                <div className={styles.actionIcons}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteMessage(msg.id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                  <button
                    className={styles.favouriteButton}
                    onClick={() => handleFavouriteMessage(msg.id, msg.favourite)}
                  >
                    <i
                      className={`fas fa-heart ${msg.favourite ? styles.favourited : ""}`}
                    ></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noMessages}>No saved messages yet.</p>
        )}
        <div className={styles.buttonsContainer}>
          <button className={styles.backButton} onClick={() => navigate("/chatbot")}>
            Back to Home
          </button>
          <button className={styles.clearButton} onClick={handleClearAllMessages}>
            Clear All Messages
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedMessages;