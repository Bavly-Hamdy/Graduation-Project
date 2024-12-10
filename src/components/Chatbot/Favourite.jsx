import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar"; // استيراد الـ Navbar
import styles from "./Favourite.module.css"; // استخدام CSS خاص بـ Favourite
import { FaTrash, FaSave } from "react-icons/fa"; // استخدام أيقونات Font Awesome

const FavouriteMessages = () => {
  const navigate = useNavigate();
  const [favouriteMessages, setFavouriteMessages] = useState([]);

  // تحميل الرسائل المفضلة من localStorage عند تحميل الصفحة
  useEffect(() => {
    const storedMessages = JSON.parse(localStorage.getItem("favouriteMessages")) || [];
    setFavouriteMessages(storedMessages);
  }, []);

  // حذف رسالة مفضلة
  const handleDeleteMessage = (index) => {
    const updatedMessages = favouriteMessages.filter((_, i) => i !== index);
    setFavouriteMessages(updatedMessages);
    localStorage.setItem("favouriteMessages", JSON.stringify(updatedMessages));
  };

  // حفظ الرسالة (هنا قد تحتاج لإضافة وظيفة إضافية مثل نقل الرسالة لقسم آخر أو تنفيذ إجراء معين)
  const handleSaveMessage = (index) => {
    const messageToSave = favouriteMessages[index];
    console.log("Message saved:", messageToSave);
    // إضافة منطق لحفظ الرسالة إذا لزم الأمر
  };

  // مسح كل الرسائل المفضلة
  const handleClearAllMessages = () => {
    setFavouriteMessages([]);
    localStorage.removeItem("favouriteMessages");
  };

  return (
    <div>
      <Navbar />

      <div className={styles.pageContainer}>
        <h2 className={styles.title}>Favourite Messages</h2>
        {favouriteMessages.length > 0 ? (
          <div className={styles.messageTable}>
            <div className={styles.tableHeader}>
              <div className={styles.columnHeader}>Favourite Messages</div>
              <div className={styles.columnHeader}>Actions</div>
            </div>
            {favouriteMessages.map((msg, index) => (
              <div key={index} className={styles.messageRow}>
                <div className={styles.messageText}>{msg.text}</div>
                <div className={styles.actionIcons}>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteMessage(index)}
                  >
                    <FaTrash />
                  </button>
                  <button
                    className={styles.saveButton}
                    onClick={() => handleSaveMessage(index)}
                  >
                    <FaSave />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noMessages}>No favourite messages yet.</p>
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

export default FavouriteMessages;
