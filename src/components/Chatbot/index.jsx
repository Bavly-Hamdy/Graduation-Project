import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { auth, realTimeDb } from "../../firebaseConfig"; // Import Firebase auth and realTimeDb
import { onAuthStateChanged } from "firebase/auth";
import { ref, set, onValue, push, remove } from "firebase/database"; // Import Firebase Realtime Database functions
import { generateContent } from "./gemini"; // Import the Gemini utility

const Chatbot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null); // Track the user's unique ID
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [savedMessages, setSavedMessages] = useState([]);
  const [favouriteMessages, setFavouriteMessages] = useState([]);

  // Fetch the authenticated user and their unique ID
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid); // Set the user's unique ID
      } else {
        setUser(null);
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch chat history from Firebase Realtime Database
  useEffect(() => {
    if (!userId) return; // Skip if no user is logged in

    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`); // Reference to the user's chat history
    onValue(chatHistoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.keys(data).map((key) => ({
          id: key, // Use the unique ID from Firebase
          ...data[key],
        }));
        setMessages(messagesArray);
      } else {
        setMessages([]); // If no messages exist, set an empty array
      }
    });
  }, [userId]);

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    const newMessage = { text: userMessage, sender: "user" };

    // Save user message to Firebase
    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    const newMessageRef = push(chatHistoryRef); // Generate a unique ID for the message
    await set(newMessageRef, newMessage);

    setMessage("");

    try {
      const botReply = await generateContent(userMessage); // Use Gemini API
      const botMessage = { text: botReply, sender: "bot" };

      // Save bot message to Firebase
      const botMessageRef = push(chatHistoryRef);
      await set(botMessageRef, botMessage);

      // Save chat history to localStorage
      const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
      const newChat = {
        date: new Date().toLocaleString(),
        messages: [newMessage, botMessage],
      };
      chatHistory.push(newChat);
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      alert(
        "حدث خطأ أثناء الاتصال بـ Gemini. تحقق من صلاحية API Key أو إعدادات الاتصال."
      );
    }
  };

  // Save a message to the "savedMessages" node in Firebase
  const handleSaveMessage = async (msg) => {
    if (!userId) return; // Skip if no user is logged in

    const savedMessagesRef = ref(realTimeDb, `Users/${userId}/savedMessages`);
    const newSavedMessageRef = push(savedMessagesRef); // Generate a unique ID for the saved message
    await set(newSavedMessageRef, msg);
  };

  // Toggle favourite status of a message
  const handleFavouriteMessage = async (msg) => {
    if (!userId) return; // Skip if no user is logged in

    const favouriteMessagesRef = ref(realTimeDb, `Users/${userId}/favouriteMessages`);
    const newFavouriteMessageRef = push(favouriteMessagesRef); // Generate a unique ID for the favourite message
    await set(newFavouriteMessageRef, msg);
  };

  // Start a new chat by clearing the chat history
  const startNewChat = async () => {
    if (!userId) return; // Skip if no user is logged in

    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    await remove(chatHistoryRef) // Clear the chat history in Firebase
      .then(() => {
        console.log("Chat history cleared successfully");
        setMessages([]); // Clear the local state
      })
      .catch((error) => {
        console.error("Error clearing chat history:", error);
      });
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className={darkMode ? styles.dark : styles.light}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>
          Logo
        </h1>
        <ul className={styles.nav_links}>
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/reminder")}>Reminder</li>
          <li onClick={() => navigate("/plan")}>Plan & Bay Chart</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
        </ul>
        <div className={styles.user_menu} onClick={toggleDropdown}>
          <div className={styles.user_icon}>
            <i className={`fas fa-${user ? "user" : "female"} fa-1x`}></i>
          </div>
          {showDropdown && (
            <div className={styles.dropdown_content}>
              <a href="#">Manage Account</a>
              <a onClick={handleLogout}>Logout</a>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <ul>
          <li onClick={() => navigate("/SavedMessages")}>Save</li>
          <li onClick={() => navigate("/history")}>History</li>
          <li onClick={() => navigate("/favourite")}>Favourite</li>
          <li onClick={() => navigate("/settings")}>Settings</li>
          <li onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </li>
        </ul>
      </div>

      {/* Chatbox */}
      <div className={styles.chatContainer}>
        <button className={styles.newChatButton} onClick={startNewChat}>
          New Chat
        </button>
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === "user"
                  ? styles.userMessage
                  : styles.botMessage
              }
            >
              <p>{msg.text}</p>
              <div className={styles.messageActions}>
                <button
                  className={styles.saveButton}
                  onClick={() => handleSaveMessage(msg)}
                >
                  <i className="fas fa-save"></i> Save
                </button>
                <button
                  className={styles.favButton}
                  onClick={() => handleFavouriteMessage(msg)}
                >
                  <i className="fas fa-star"></i> Favourite
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.messageBox}>
          <div className={styles.iconsLeft}>
            <img
              src="https://icons.iconarchive.com/icons/iconoir-team/iconoir/128/attachment-icon.png"
              alt="Upload"
              className={styles.icon}
            />
            <img
              src="https://www.iconarchive.com/download/i112658/fa-team/fontawesome/FontAwesome-Microphone.512.png"
              alt="Voice"
              className={styles.icon}
            />
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
          />
          <div className={styles.iconsRight}>
            <img
              src="https://icons.iconarchive.com/icons/icons8/ios7/128/Arrows-Right-2-icon.png"
              onClick={sendMessage}
              className={styles.sendIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;