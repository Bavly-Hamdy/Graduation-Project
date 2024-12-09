import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // استيراد الـ Navbar
import styles from "./Save.module.css";

const SavedMessages = () => {
  const navigate = useNavigate();
  const [savedMessages, setSavedMessages] = useState([]);
  const [user, setUser] = useState(true); // لتحديد نوع المستخدم، يمكنك تعديل هذه القيمة بحسب حالتك.

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

  // إضافة رسالة للمفضلة
  const handleFavouriteMessage = (index) => {
    const updatedMessages = [...savedMessages];
    updatedMessages[index].favourite = !updatedMessages[index].favourite;
    setSavedMessages(updatedMessages);
    localStorage.setItem("savedMessages", JSON.stringify(updatedMessages));
  };

  // مسح كل الرسائل المحفوظة
  const handleClearAllMessages = () => {
    setSavedMessages([]);
    localStorage.removeItem("savedMessages");
  };

  return (
    <div>
      {/* استخدام الـ Navbar هنا */}
      <Navbar user={user} />

      <div className={styles.pageContainer}>
        <h2 className={styles.title}>Saved Messages</h2>
        {savedMessages.length > 0 ? (
          <div className={styles.messageTable}>
            <div className={styles.tableHeader}>
              <div className={styles.columnHeader}>Saved Messages</div>
              <div className={styles.columnHeader}>Actions</div>
            </div>
            {savedMessages.map((msg, index) => (
              <div key={index} className={styles.messageRow}>
                <div className={styles.messageText}>{msg.text}</div>
                <div className={styles.actionIcons}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteMessage(index)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                  <button
                    className={styles.favouriteButton}
                    onClick={() => handleFavouriteMessage(index)}
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
