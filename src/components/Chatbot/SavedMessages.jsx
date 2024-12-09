import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Save.module.css";

const SavedMessages = () => {
  const navigate = useNavigate();
  const [savedMessages, setSavedMessages] = useState([]);

  // تحميل الرسائل المحفوظة من localStorage عند تحميل الصفحة
  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("savedMessages")) || [];
    setSavedMessages(storedMessages);
  }, []);

  // حذف رسالة محفوظة
  const handleDeleteMessage = (index) => {
    const updatedMessages = savedMessages.filter((_, i) => i !== index);
    setSavedMessages(updatedMessages);
    localStorage.setItem("savedMessages", JSON.stringify(updatedMessages));
  };

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>Saved Messages</h2>
      {savedMessages.length > 0 ? (
        <div className={styles.messageList}>
          {savedMessages.map((msg, index) => (
            <div key={index} className={styles.messageCard}>
              <p className={styles.messageText}>{msg.text}</p>
              <button
                className={styles.deleteButton}
                onClick={() => handleDeleteMessage(index)}
              >
                <i className="fas fa-trash"></i> Delete
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noMessages}>No saved messages yet.</p>
      )}
      <button className={styles.backButton} onClick={() => navigate("/chatbot")}>
        Back to Home
      </button>
    </div>
  );
};

export default SavedMessages;
