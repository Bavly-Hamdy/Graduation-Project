// Navbar.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = ({ user }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
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
            <a onClick={() => alert("Logging out...")}>Logout</a>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
