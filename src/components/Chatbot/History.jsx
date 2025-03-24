import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // Import Navbar
import styles from "./History.module.css"; // CSS for the History page

const HistoryPage = () => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);

  // Load chat history from localStorage when the page loads
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(storedHistory);
  }, []);

  // Handle selecting a chat
  const handleSelectChat = (index) => {
    const selectedChat = chatHistory[index];
    localStorage.setItem("currentChat", JSON.stringify(selectedChat));
    navigate("/chatbot");
  };

  // Clear all chat history
  const handleClearAllHistory = () => {
    setChatHistory([]);
    localStorage.removeItem("chatHistory");
  };

  return (
    <div>
      <Navbar />
      <div className={styles.pageContainer}>
        <h2 className={styles.title}>Chat History</h2>
        {chatHistory.length > 0 ? (
          <div className={styles.historyList}>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={styles.historyItem}
                onClick={() => handleSelectChat(index)}
              >
                <p className={styles.chatPreview}>
                  {chat.messages[0].text} ... ({chat.date})
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noHistory}>No chat history available.</p>
        )}
        <div className={styles.buttonsContainer}>
          <button className={styles.clearButton} onClick={handleClearAllHistory}>
            Clear All History
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;