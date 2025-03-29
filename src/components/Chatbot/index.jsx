import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { auth, realTimeDb } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set, onValue, push, remove } from "firebase/database";
import { generateContent } from "./gemini";

const Chatbot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);

  // تعريف مكونات Markdown المخصصة للتنسيق
  const markdownComponents = {
    h1: ({ node, ...props }) => <h1 className={styles.markdownH1} {...props} />,
    h2: ({ node, ...props }) => <h2 className={styles.markdownH2} {...props} />,
    h3: ({ node, ...props }) => <h3 className={styles.markdownH3} {...props} />,
    p: ({ node, ...props }) => <p className={styles.markdownP} {...props} />,
    ul: ({ node, ...props }) => <ul className={styles.markdownUl} {...props} />,
    ol: ({ node, ...props }) => <ol className={styles.markdownOl} {...props} />,
    li: ({ node, ...props }) => <li className={styles.markdownLi} {...props} />,
    strong: ({ node, ...props }) => <strong className={styles.markdownStrong} {...props} />,
  };

  // متابعة حالة الـ Auth للمستخدم
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserId(currentUser.uid);
      } else {
        setUser(null);
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // جلب سجل الدردشة من Firebase
  useEffect(() => {
    if (!userId) return;
    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    onValue(chatHistoryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
    });
  }, [userId]);

  // التمرير لآخر الرسائل
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // دالة لتنسيق رد البوت (يمكن تعديلها حسب المطلوب)
  const formatBotReply = (reply) => {
    // هنا ممكن نضيف تعديلات لو محتاجين نمسح رموز غير مرغوبة، بس الأساس إن الرد هيكون Markdown
    return reply.trim();
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    const newMessage = { text: userMessage, sender: "user" };

    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    // حفظ رسالة المستخدم
    const newMessageRef = push(chatHistoryRef);
    await set(newMessageRef, newMessage);

    setMessage("");

    try {
      // إضافة رسالة مؤقتة بتوضح إن البوت بيفكر
      const tempBotMessage = { text: "البوت بيفكر...", sender: "bot", temporary: true };
      const tempMessageRef = push(chatHistoryRef);
      await set(tempMessageRef, tempBotMessage);

      // محاكاة تأخير للتفكير (مثلاً 2 ثانية)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // جلب الرد من Gemini API
      const botReply = await generateContent(userMessage);
      // إزالة الرسالة المؤقتة من Firebase
      await remove(tempMessageRef);

      // تنسيق الرد قبل حفظه
      const formattedReply = formatBotReply(botReply);
      const botMessage = { text: formattedReply, sender: "bot" };
      const botMessageRef = push(chatHistoryRef);
      await set(botMessageRef, botMessage);

      // حفظ سجل الدردشة محليًا لو حابب تستخدمه
      const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
      const newChat = {
        date: new Date().toLocaleString(),
        messages: [newMessage, botMessage],
      };
      chatHistory.push(newChat);
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      alert("حدث خطأ أثناء الاتصال بـ Gemini. تحقق من صلاحية API Key أو إعدادات الاتصال.");
    }
  };

  // حفظ الرسالة للمفضلة
  const handleSaveMessage = async (msg) => {
    if (!userId) return;
    const savedMessagesRef = ref(realTimeDb, `Users/${userId}/savedMessages`);
    const newSavedMessageRef = push(savedMessagesRef);
    await set(newSavedMessageRef, msg);
  };

  // تفضيل الرسالة
  const handleFavouriteMessage = async (msg) => {
    if (!userId) return;
    const favouriteMessagesRef = ref(realTimeDb, `Users/${userId}/favouriteMessages`);
    const newFavouriteMessageRef = push(favouriteMessagesRef);
    await set(newFavouriteMessageRef, msg);
  };

  // بدء محادثة جديدة بمسح سجل الدردشة
  const startNewChat = async () => {
    if (!userId) return;
    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    await remove(chatHistoryRef)
      .then(() => {
        console.log("Chat history cleared successfully");
        setMessages([]);
      })
      .catch((error) => {
        console.error("Error clearing chat history:", error);
      });
  };

  // التعامل مع زر Enter لإرسال الرسالة
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

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
              <button type="button" onClick={() => {}} className={styles.dropdownItem}>
                Manage Account
              </button>
              <button type="button" onClick={handleLogout} className={styles.dropdownItem}>
                Logout
              </button>
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
        <button className={styles.newChatButton} onClick={startNewChat}>
          New Chat
        </button>
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.sender === "user" ? styles.userMessage : styles.botMessage
              }
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown components={markdownComponents}>
                  {msg.text}
                </ReactMarkdown>
              ) : (
                <p>{msg.text}</p>
              )}
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
          <div ref={messagesEndRef} />
        </div>
        <div className={styles.messageBox}>
          <div className={styles.iconsLeft}>
            <img
              src="https://icons.iconarchive.com/icons/iconoir-team/iconoir/128/attachment-icon.png"
              alt="Upload Icon"
              className={styles.icon}
            />
            <img
              src="https://www.iconarchive.com/download/i112658/fa-team/fontawesome/FontAwesome-Microphone.512.png"
              alt="Voice Icon"
              className={styles.icon}
            />
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className={styles.messageInput}
          />
          <div className={styles.iconsRight}>
            <img
              src="https://icons.iconarchive.com/icons/icons8/ios7/128/Arrows-Right-2-icon.png"
              alt="Send Icon"
              onClick={sendMessage}
              className={styles.sendIcon}
            />
          </div>
        </div>
        {/* زرار للانتقال لآخر الرسائل */}
        <button className={styles.scrollButton} onClick={scrollToBottom}>
          ↓
        </button>
      </div>
    </div>
  );
};

export default Chatbot;