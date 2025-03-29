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

  // للتحكم في فتح/قفل الـSidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // للتحكم في إظهار الـDropdown بتاع الـUser
  const [showDropdown, setShowDropdown] = useState(false);

  // رسائل الشات
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  // Dark Mode
  const [darkMode, setDarkMode] = useState(false);

  // مرجع لآخر الرسائل للتمرير
  const messagesEndRef = useRef(null);

  // مكونات الـMarkdown
  const markdownComponents = {
    h1: ({ node, children, ...props }) => (
      <h1 className={styles.markdownH1} {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }) => (
      <h2 className={styles.markdownH2} {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }) => (
      <h3 className={styles.markdownH3} {...props}>
        {children}
      </h3>
    ),
    p: ({ node, children, ...props }) => (
      <p className={styles.markdownP} {...props}>
        {children}
      </p>
    ),
    ul: ({ node, children, ...props }) => (
      <ul className={styles.markdownUl} {...props}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }) => (
      <ol className={styles.markdownOl} {...props}>
        {children}
      </ol>
    ),
    li: ({ node, children, ...props }) => (
      <li className={styles.markdownLi} {...props}>
        {children}
      </li>
    ),
    strong: ({ node, children, ...props }) => (
      <strong className={styles.markdownStrong} {...props}>
        {children}
      </strong>
    ),
  };

  // تابع حالة الـAuth
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

  // جلب سجل الدردشة من الـFirebase
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
        messagesArray.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setMessages(messagesArray);
      } else {
        setMessages([]);
      }
    });
  }, [userId]);

  // بعد تحديث الرسائل، انزل لآخرها
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // دوال بسيطة
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const formatBotReply = (reply) => reply.trim();
  const getCurrentTimestamp = () => new Date().toISOString();

  // إرسال رسالة (عادي)
  const sendMessage = async () => {
    if (!message.trim()) return;
    const userMessage = message.trim();
    const newMessage = {
      text: userMessage,
      sender: "user",
      timestamp: getCurrentTimestamp(),
    };

    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    const newMessageRef = push(chatHistoryRef);
    await set(newMessageRef, newMessage);

    setMessage("");

    try {
      // رسالة مؤقتة
      const tempBotMessage = {
        text: "بيفكر...",
        sender: "bot",
        temporary: true,
        timestamp: getCurrentTimestamp(),
      };
      const tempMessageRef = push(chatHistoryRef);
      await set(tempMessageRef, tempBotMessage);

      // محاكاة تأخير
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // استدعاء Gemini
      const botReply = await generateContent(userMessage);
      await remove(tempMessageRef);

      const formattedReply = formatBotReply(botReply);
      const botMessage = {
        text: formattedReply,
        sender: "bot",
        timestamp: getCurrentTimestamp(),
      };
      const botMessageRef = push(chatHistoryRef);
      await set(botMessageRef, botMessage);
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      alert("حدث خطأ أثناء الاتصال بـ Gemini.");
    }
  };

  // DeepThinking
  const handleDeepThinking = async () => {
    if (!message.trim()) return;
    const userMessage = message.trim();
    const newMessage = {
      text: userMessage,
      sender: "user",
      timestamp: getCurrentTimestamp(),
    };

    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    const newMessageRef = push(chatHistoryRef);
    await set(newMessageRef, newMessage);

    setMessage("");

    try {
      // مؤقت
      const tempBotMessage = {
        text: "بيفكر بعمق...",
        sender: "bot",
        temporary: true,
        timestamp: getCurrentTimestamp(),
      };
      const tempMessageRef = push(chatHistoryRef);
      await set(tempMessageRef, tempBotMessage);

      // تأخير أطول
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const botReply = await generateContent(userMessage, true);
      await remove(tempMessageRef);

      const formattedReply = formatBotReply(botReply);
      const botMessage = {
        text: formattedReply,
        sender: "bot",
        timestamp: getCurrentTimestamp(),
      };
      const botMessageRef = push(chatHistoryRef);
      await set(botMessageRef, botMessage);
    } catch (error) {
      console.error("Error sending deep thinking message to Gemini:", error);
      alert("حدث خطأ أثناء الاتصال بـ Gemini في وضع DeepThinking.");
    }
  };

  // حفظ رسالة
  const handleSaveMessage = async (msg) => {
    if (!userId) return;
    const savedMessagesRef = ref(realTimeDb, `Users/${userId}/savedMessages`);
    const newSavedMessageRef = push(savedMessagesRef);
    await set(newSavedMessageRef, msg);
  };

  // تفضيل رسالة
  const handleFavouriteMessage = async (msg) => {
    if (!userId) return;
    const favouriteMessagesRef = ref(realTimeDb, `Users/${userId}/favouriteMessages`);
    const newFavouriteMessageRef = push(favouriteMessagesRef);
    await set(newFavouriteMessageRef, msg);
  };

  // بدء شات جديد
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

  // إرسال بالـEnter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // هل الشات جديد؟
  const isNewChat = messages.length === 0;

  return (
    <div className={darkMode ? styles.dark : styles.light}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        {/* Logo */}
        <div className={styles.navLeft}>
          <h2 className={styles.logo} onClick={() => navigate("/")}>
            Logo
          </h2>
        </div>

        {/* Links في النص (لو عايز تعرضهم) */}
        <ul className={styles.nav_links}>
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/reminder")}>Reminder</li>
          <li onClick={() => navigate("/plan")}>Plan & Chart</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
        </ul>

        {/* User Menu */}
        <div className={styles.user_menu} onClick={toggleDropdown}>
          <div className={styles.user_icon}>
            <i className={`fas fa-${user ? "user" : "female"} fa-1x`}></i>
          </div>
          {showDropdown && (
            <div className={styles.dropdown_content}>
              <button type="button" className={styles.dropdownItem}>
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
      <div className={`${styles.sidebar} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
        <div className={styles.sidebarTop}>
          {/* زرار Toggle */}
          <button className={styles.sidebarBtn} onClick={toggleSidebar}>
            {/* لو مفتوح، أيقونة سهم لليسار + نص Collapse
                ولو مقفول، أيقونة سهم لليمين من غير نص */}
            {sidebarOpen ? (
              <>
                <i className="fas fa-angle-double-left"></i>
                <span>Collapse</span>
              </>
            ) : (
              <i className="fas fa-angle-double-right"></i>
            )}
          </button>

          {/* زرار New Chat */}
          <button className={styles.sidebarBtn} onClick={startNewChat}>
            <i className="fas fa-plus"></i>
            {sidebarOpen && <span>New Chat</span>}
          </button>
        </div>

        {/* القوائم العادية */}
        <ul className={styles.sidebarMenu}>
          <li onClick={() => navigate("/SavedMessages")}>
            <i className="fas fa-save"></i>
            {sidebarOpen && <span>Save</span>}
          </li>
          <li onClick={() => navigate("/history")}>
            <i className="fas fa-history"></i>
            {sidebarOpen && <span>History</span>}
          </li>
          <li onClick={() => navigate("/favourite")}>
            <i className="fas fa-star"></i>
            {sidebarOpen && <span>Favourite</span>}
          </li>
          <li onClick={() => navigate("/settings")}>
            <i className="fas fa-cog"></i>
            {sidebarOpen && <span>Settings</span>}
          </li>
          <li onClick={toggleDarkMode}>
            <i className="fas fa-adjust"></i>
            {sidebarOpen && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </li>
        </ul>
      </div>

      {/* Chat Container */}
      <div
        className={`${styles.chatContainer} ${
          sidebarOpen ? styles.withSidebar : styles.fullWidth
        }`}
      >
        {isNewChat ? (
          <div className={styles.newChatCenter}>
            <h1 className={styles.newChatTitle}>What can I help with?</h1>
          </div>
        ) : (
          <div className={styles.messages}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? styles.userMessage
                    : msg.temporary
                    ? `${styles.botMessage} ${styles.deepThinking}`
                    : styles.botMessage
                }
              >
                {msg.sender === "bot" ? (
                  <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                ) : (
                  <p>{msg.text}</p>
                )}
                <div className={styles.messageActions}>
                  <button className={styles.saveButton} onClick={() => handleSaveMessage(msg)}>
                    <i className="fas fa-save"></i>
                  </button>
                  <button className={styles.favButton} onClick={() => handleFavouriteMessage(msg)}>
                    <i className="fas fa-star"></i>
                  </button>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Message Box */}
        <div className={styles.messageBox}>
          {/* Attach */}
          <button className={styles.iconBtn}>
            <i className="fas fa-paperclip"></i>
          </button>

          {/* Input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className={styles.messageInput}
          />

          {/* Search */}
          <button className={styles.iconBtn}>
            <i className="fas fa-search"></i>
          </button>

          {/* DeepThinking */}
          <button className={styles.iconBtn} onClick={handleDeepThinking}>
            <i className="fas fa-brain"></i>
          </button>

          {/* Send */}
          <button className={styles.sendBtn} onClick={sendMessage}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;