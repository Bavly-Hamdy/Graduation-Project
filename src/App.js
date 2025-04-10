import React, { useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Main from "./components/Main";
import Signup from "./components/Singup";
import Login from "./components/Login";
import Chatbot from "./components/Chatbot";
import SavedMessages from "./components/Chatbot/SavedMessages";
import FavouriteMessages from "./components/Chatbot/Favourite";
import History from "./components/Chatbot/History";
import Settings from "./components/Chatbot/Settings";
import Reminder from "./components/Reminder/Reminder";
import PlanAndPieChart from "./components/PlanAndPieChart/PlanAndPieChart";
import AboutProject from "./components/About/AboutProject"; // ✅ Correct Import
import ContactUs from "./components/Contact/ContactUs"; // تم إضافة صفحة Contact Us

function App() {
  const user = localStorage.getItem("token");
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("en");

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  return (
    <Routes>
      {user ? (
        <>
          <Route path="/" exact element={<Main />} />
          <Route
            path="/chatbot"
            element={
              <Chatbot
                darkMode={darkMode}
                language={language}
                toggleDarkMode={toggleDarkMode}
                handleLogout={handleLogout}
              />
            }
          />
        </>
      ) : (
        <Route path="/" element={<Navigate replace to="/login" />} />
      )}
      <Route
        path="/SavedMessages"
        element={<SavedMessages darkMode={darkMode} language={language} />}
      />
      <Route
        path="/favourite"
        element={<FavouriteMessages darkMode={darkMode} language={language} />}
      />
      <Route
        path="/history"
        exact
        element={<History darkMode={darkMode} language={language} />}
      />
      <Route path="/signup" exact element={<Signup />} />
      <Route path="/login" exact element={<Login />} />
      <Route
        path="/settings"
        element={
          <Settings
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            handleLogout={handleLogout}
            setLanguage={setLanguage}
            language={language}
          />
        }
      />
      <Route path="/reminder" element={<Reminder />} />
      <Route path="/plan" element={<PlanAndPieChart />} />
      <Route path="/about" element={<AboutProject />} />
      <Route path="/contact" element={<ContactUs />} /> {/* صفحة Contact Us */}
    </Routes>
  );
}

export default App;