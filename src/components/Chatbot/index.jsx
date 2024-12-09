import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

const Chatbot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [savedMessages, setSavedMessages] = useState([]);
  const [favouriteMessages, setFavouriteMessages] = useState([]);

  // قراءة الـ API Key من متغير البيئة
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  // تبديل قائمة المستخدم
  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // تبديل الوضع الداكن
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // إرسال الرسالة والحصول على الرد من ChatGPT
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessages([...messages, { text: userMessage, sender: "user" }]);
    setMessage("");

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            ...messages.map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: userMessage },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const botReply = response.data.choices[0].message.content;
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botReply, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error sending message to ChatGPT:", error.response?.data || error);
      alert(
        "حدث خطأ أثناء الاتصال بـ ChatGPT. تحقق من صلاحية API Key أو إعدادات الاتصال."
      );
    }
  };

  // إضافة رسالة إلى الـ Saved Messages
  const handleSaveMessage = (msg) => {
    const updatedSavedMessages = [...savedMessages, msg];
    setSavedMessages(updatedSavedMessages);
    localStorage.setItem("savedMessages", JSON.stringify(updatedSavedMessages));
  };

  // إضافة رسالة إلى الـ Favourite Messages
  const handleFavouriteMessage = (msg) => {
    setFavouriteMessages((prevFav) => [...prevFav, msg]);
  };

  // متابعة حالة المستخدم
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className={darkMode ? styles.dark : styles.light}>
      {/* Navbar */}
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
              <a onClick={handleLogout}>Logout</a>
            </div>
          )}
        </div>
      </nav>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <ul>
          <li onClick={() => navigate("/SavedMessages")}>Save</li>
          <li onClick={() => navigate("/history")}>History</li>
          <li onClick={() => navigate("/favourite")}>Favourite</li>
          <li onClick={() => navigate("/settings")}>Settings</li>
          <li onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </li>
        </ul>
      </div>

      {/* Chatbox */}
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === "user"
                  ? styles.userMessage
                  : styles.botMessage
              }
            >
              <p>{msg.text}</p>
              <div className={styles.messageActions}>
                <button
                  className={styles.saveButton}
                  onClick={() => handleSaveMessage(msg)}
                >
                  <i className="fas fa-save"></i> Save
                </button>
                <button
                  className={styles.favButton}
                  onClick={() => handleFavouriteMessage(msg)}
                >
                  <i className="fas fa-star"></i> Favourite
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.messageBox}>
          <div className={styles.iconsLeft}>
            {/* Upload و Voice Icons داخل شريط الرسالة */}
            <img
              src="https://www.flaticon.com/download/icon/154611?icon_id=154611&author=163&team=163&keyword=Paperclip&pack=154586&style=1&style_id=5&format=png&color=%23000000&colored=1&size=512&selection=1&type=standard"
              alt="Upload"
              className={styles.icon}
            />
            <img
              src="https://www.iconarchive.com/download/i112658/fa-team/fontawesome/FontAwesome-Microphone.512.png"
              alt="Voice"
              className={styles.icon}
            />
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <div className={styles.iconsRight}>
            <img
              src="https://www.flaticon.com/download/icon/9333991?icon_id=9333991&author=1294&team=1294&keyword=Send&pack=9333862&style=1&style_id=1370&format=png&color=%23000000&colored=1&size=512&selection=1&type=standard&token=03AFcWeA4sINaafmg6j4sGYxvhHe0ubt4ntLJaeokNtm8ka1gvUjMNWsWYyeYMwb4JtiS4R2evrSe5LQ1qbTCRVwOwQwqa1JrwuseCJZJrWuHdHPTBu9cHf4WiD57rd72B_fHZuokqir9Ug3HBiDWmw9OIp5QRathHg4NLbm85VyP6u5_np2RZI_AQxYaCMaO9AIKWUBpkthMuGAT-eyfpmpLLkudBV8li2_89zhgC6CgXtXkKZgY0ypn45XrPRKijrr4IfzKVbOKypOn-QZh9SvVunkjk_sOfpkZjmMZFCub4lQx5CUrz0XwoxI-aWgD7IUesIBG3dLsHycIMoII-yiY8qeCvN-_1W4FlrWQuuBiaOOJVelrY8zLi2-9Gd_lrI2_i6ZpTlVIRK35OSboFnNrwmAnHW5vc0va7SQ-FY71tVdu_0PzAMy_SVJcF_WM7JDcN-WYAng1ZRA5wVu98jTtEnAaztWeCpEXxd5WqewQjT_7xE1qK7reFmpo7AxIWd4ToGU8VDFMjVebVRjtXfMpSwzKKajx_FwLVdpOihEQhU3DNbfZq0vrH5d2TYx07vBEShJSEsW4TQ7qXH0bVFqueg0z6YzURT9gZ_vcpeoGNRhgtZv-byD_ziXTknTb4BwgBpRVMMOKJepA_lqr27U_TLIp6bK4NpDMgeuEGn6MBU1hArZTyEFrHkFcqTkCfJwAjQv8Z6qGBUa5BbKDGIVgekHf7rZPraqJoMaqQ7cKIgTd23rctrp3MYSRcjWdxOJWBSKtqI9o-2B671_Blq7_9dzZxd8fBDkSR-XX9ZNpcog06Owxld_NHUXOPtC1gl9ZQsUW0ivCb6tAJ6_vGtLEo-entG2t1ArpL7DWdhnTq3ToGFWYXSUZ6j3c1SKVSFQ_OTFqx3giG1-kdqvSwYiHeNO9Tu45zMrEoGOk9niLCLqbxDXsMB1lDXJk7Biqf69nzhlLNmgyo__Y7B49juKGt46MvHfbcireA78RnvlNeDnx_ANrIjsX1qgyTq-wi_f0iYwZ_kUrW4gFWCeDnKEgrVb2ncQi20FCLePo1P12GAWzP4It_OqGv9ppPwkx0B54iZebyPpbXX1s-DKon48PLmuSCiY-csufoiwf9Gaz_pz6ewpbF8dCS9PmrS_YltrVrSA6j23xNIuB7uBEtnk7rz5A6Z5pfQkEjpgd4ePqxc1rTP25AmmtnAqNIR3PCaj8Iy9zG8NW_gjXQlqumEo5DUJFV0zTIC1oVXU7GUM7cpiakjio95XGcIjzUFQoAzMzGhKjudgcV8wcJHSXr77rF7B46sTL99ZAvgZs-V_f_HjhpBPB2mHJHri5BueMfnBTtguDCzPGcHUKpUu9B9DeGpqMeZHfeFWy82KazTLIeuZndaeKE6sJlQdJ41-rnvFHSLMVzqXMOQjgifcxDychvChR-u6f5IW-JGs8uiSq6mbeb0LSeB4Ya8Ivv1XWslkn9zxFO0x7WimsELOP8aX9pseOo0o7VV3bZ1DeTigq2hLOs-3f0rLpYZTnuCQZ9h19L-Qnorjl6TJRtv9JGyDxKVmnOheiWZkLaapVveqClXZLU4kFBHjX5MY_9Lv9n9OU9GAfI56wn6KZ51SgEbracTFG1rgYmNQR0lnup2KLhOv3zNrhhgjIoDGISPYe7moILmhwDypUE4DDZJBH_YXbpewA_8LzgWy9LAbLWIfDjOhZDIbFvZqf_8E_eY_QrvV3OA5DlLSg4eNwWO9_sRMmxO9LNzSSfvUsOwBzZsD9rgfOxDUMbpI4DBh4_2VDieqqtZuUYwx9kKtDH_sL_z-Q0PRfvrtf5xDKzYavIAt0oMRRaGYdtxS4tO21od5Dj_eMTfxcFMnQtb60ZFaDY2Or7mwiJCu3gO7o7hI1AaX7ZiTXJml2ccmLxRiKc9T4aWQbIp06X1P&search=send"
              onClick={sendMessage}
              className={styles.sendIcon}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
