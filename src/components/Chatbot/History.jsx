import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // استيراد الـ Navbar
import styles from "./History.module.css"; // CSS خاص بالصفحة

const HistoryPage = () => {
  const navigate = useNavigate();
  const [chatHistory, setChatHistory] = useState([]);

  // تحميل بيانات الـ History عند فتح الصفحة
  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setChatHistory(storedHistory);
  }, []);

  // التعامل مع اختيار شات معين
  const handleSelectChat = (index) => {
    const selectedChat = chatHistory[index];
    localStorage.setItem("currentChat", JSON.stringify(selectedChat));
    navigate("/chatbot");
  };

  // مسح كل المحادثات
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
