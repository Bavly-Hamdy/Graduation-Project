import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const History = () => {
  const historyMessages = JSON.parse(localStorage.getItem("historyMessages")) || [];
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <h2>Chat History</h2>
      {historyMessages.length > 0 ? (
        historyMessages.map((msg, index) => (
          <div key={index} className={styles.messageCard}>
            <p>{msg}</p>
          </div>
        ))
      ) : (
        <p>No history messages yet.</p>
      )}
    </div>
  );
};

export default History;
