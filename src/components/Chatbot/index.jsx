import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const Chatbot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [savedMessages, setSavedMessages] = useState([]);
  const [favouriteMessages, setFavouriteMessages] = useState([]);
  const [history, setHistory] = useState([]);

  const apiKey = process.env.REACT_APP_API_KEY;

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
    setMessages([...messages, { text: userMessage, sender: "user" }]);
    setMessage("");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: userMessage },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const botReply = response.data.choices[0].message.content;
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botReply, sender: "bot" },
      ]);

      const updatedHistory = [...history, { userMessage, botReply }];
      setHistory(updatedHistory);
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    } catch (error) {
      console.error("Error sending message to ChatGPT:", error.response?.status || error);
      alert(
        "حدث خطأ أثناء الاتصال بـ ChatGPT. تحقق من صلاحية API Key أو إعدادات الاتصال."
      );
    }
  };

  const handleSaveMessage = (msg) => {
    const savedMessages = JSON.parse(localStorage.getItem("savedMessages")) || [];
    const updatedSavedMessages = [...savedMessages, msg];
    setSavedMessages(updatedSavedMessages);
    localStorage.setItem("savedMessages", JSON.stringify(updatedSavedMessages));
  };

  const handleFavouriteMessage = (msg) => {
    const favourites = JSON.parse(localStorage.getItem("favouriteMessages")) || [];
    const updatedFavourites = [...favourites, msg];
    setFavouriteMessages(updatedFavourites);
    localStorage.setItem("favouriteMessages", JSON.stringify(updatedFavourites));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("history")) || [];
    setHistory(savedHistory);
  }, []);

  const startNewChat = () => {
    setMessages([]);
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
            onKeyPress={handleKeyPress} // Add this line
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