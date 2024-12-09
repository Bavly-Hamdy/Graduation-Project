import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";

const Favourite = () => {
  const favouriteMessages = JSON.parse(localStorage.getItem("favouriteMessages")) || [];
  const navigate = useNavigate();

  return (
    <div className={styles.pageContainer}>
      <h2>Favourite Messages</h2>
      {favouriteMessages.length > 0 ? (
        favouriteMessages.map((msg, index) => (
          <div key={index} className={styles.messageCard}>
            <p>{msg.text}</p>
          </div>
        ))
      ) : (
        <p>No favourite messages yet.</p>
      )}
    </div>
  );
};

export default Favourite;
