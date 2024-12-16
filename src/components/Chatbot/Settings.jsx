import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';

const Settings = ({ darkMode, toggleDarkMode, handleLogout, setLanguage, language }) => {
  const navigate = useNavigate();

  const handleDeleteHistory = () => {
    if (window.confirm("Are you sure you want to delete chat history?")) {
      localStorage.removeItem("chatHistory");
      localStorage.removeItem("savedMessages");
      localStorage.removeItem("favouriteMessages");
      alert("Chat history has been cleared.");
    }
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className={darkMode ? styles.dark : styles.light} style={{ height: '100%' }}>
      <div className={styles.settingsContainer}>
        <h2 className={styles.settingsTitle}>{language === 'ar' ? 'إعدادات' : 'Settings'}</h2>

        <div className={styles.settingOption}>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.optionLabel}>
            {darkMode ? (language === 'ar' ? 'الوضع الفاتح' : 'Light Mode') : (language === 'ar' ? 'الوضع الداكن' : 'Dark Mode')}
          </span>
        </div>

        <div className={styles.settingOption}>
          <h3>{language === 'ar' ? 'تغيير اللغة' : 'Change Language'}</h3>
          <ul className={styles.languageList}>
            <li onClick={() => changeLanguage('ar')} style={{ cursor: 'pointer' }}>
              عربي
            </li>
            <li onClick={() => changeLanguage('en')} style={{ cursor: 'pointer' }}>
              English
            </li>
          </ul>
        </div>

        <div className={styles.settingOption}>
          <button className={styles.deleteButton} onClick={handleDeleteHistory}>
            {language === 'ar' ? 'مسح الدردشة' : 'Clear Chat'}
          </button>
        </div>

        <div className={styles.settingOption}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </button>
        </div>

        <button className={styles.backButton} onClick={() => navigate(-1)}>
          {language === 'ar' ? 'العودة' : 'Back'}
        </button>
      </div>
    </div>
  );
};

export default Settings;