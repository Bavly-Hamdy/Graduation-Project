import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { auth, realTimeDb } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ref, set, onValue, push, remove, update } from "firebase/database";
import { generateContent } from "./gemini";
import ManageAccount from "../ManageAccount/ManageAccount"; // تأكد من المسار الصحيح

const generateFileSummary = async (text) => {
  return `ملخص الملف: محتوى الملف غير متوفر حالياً.`;
};

const splitByLanguage = (text) => {
  const segments = [];
  let currentSegment = "";
  let currentLang = null;
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0621-\u064A]/;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const isArabic = arabicRegex.test(char);
    const charLang = isArabic ? "ar" : "en";
    
    if (currentLang === null) {
      currentLang = charLang;
      currentSegment += char;
    } else if (currentLang === charLang) {
      currentSegment += char;
    } else {
      segments.push({ text: currentSegment, lang: currentLang });
      currentSegment = char;
      currentLang = charLang;
    }
  }
  
  if (currentSegment) {
    segments.push({ text: currentSegment, lang: currentLang });
  }
  
  return segments;
};

const markdownComponents = {
  h1: ({ node, children, ...props }) => (
    <h1 className={styles.markdownH1} {...props}>{children}</h1>
  ),
  h2: ({ node, children, ...props }) => (
    <h2 className={styles.markdownH2} {...props}>{children}</h2>
  ),
  h3: ({ node, children, ...props }) => (
    <h3 className={styles.markdownH3} {...props}>{children}</h3>
  ),
  p: ({ node, children, ...props }) => (
    <p className={styles.markdownP} {...props}>{children}</p>
  ),
  ul: ({ node, children, ...props }) => (
    <ul className={styles.markdownUl} {...props}>{children}</ul>
  ),
  ol: ({ node, children, ...props }) => (
    <ol className={styles.markdownOl} {...props}>{children}</ol>
  ),
  li: ({ node, children, ...props }) => (
    <li className={styles.markdownLi} {...props}>{children}</li>
  ),
  strong: ({ node, children, ...props }) => (
    <strong className={styles.markdownStrong} {...props}>{children}</strong>
  ),
};

const handleExternalTTS = async (text) => {
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languageCode: "ar-EG" }),
    });
    const data = await response.json();
    if (data && data.audioContent) {
      const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
      audio.play();
      return new Promise((resolve) => {
        audio.onended = resolve;
      });
    } else {
      alert("لم يتم استلام صوت من الخدمة الخارجية.");
    }
  } catch (error) {
    console.error("Error in external TTS:", error);
    alert("خطأ في خدمة TTS الخارجية.");
  }
};

const Chatbot = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [attachedFileUrl, setAttachedFileUrl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState("ar-EG");
  const [voices, setVoices] = useState([]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      let attempts = 0;
      const checkVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        if (availableVoices.length === 0 && attempts < 10) {
          attempts++;
          setTimeout(checkVoices, 100);
        } else {
          setVoices(availableVoices);
          console.log("الأصوات المتاحة:", availableVoices);
        }
      };
      checkVoices();
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const refreshVoices = () => {
    const availableVoices = speechSynthesis.getVoices();
    setVoices(availableVoices);
    console.log("تم تحديث الأصوات:", availableVoices);
  };

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    setShowScrollButton(scrollHeight - scrollTop > clientHeight + 50);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  const formatBotReply = (reply) => reply.trim();
  const getCurrentTimestamp = () => new Date().toISOString();

  const generateFileUrl = async (file) => {
    return `https://example.com/uploads/${file.name}`;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    let userMessage = message.trim();
    if (attachedFile) {
      let fileUrl = attachedFileUrl;
      if (!fileUrl) {
        fileUrl = await generateFileUrl(attachedFile);
        setAttachedFileUrl(fileUrl);
      }
      userMessage = `Attachment: ${attachedFile.name}\nURL: ${fileUrl}\n${userMessage}`;
    }
    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    const newMessage = {
      text: userMessage,
      sender: "user",
      timestamp: getCurrentTimestamp(),
      attachment: !!attachedFile,
    };
    const newMessageRef = push(chatHistoryRef);
    await set(newMessageRef, newMessage);
    setMessage("");
    setAttachedFile(null);
    setAttachedFileUrl(null);
    try {
      const tempBotMessage = {
        text: "بيفكر...",
        sender: "bot",
        temporary: true,
        timestamp: getCurrentTimestamp(),
      };
      const tempMessageRef = push(chatHistoryRef);
      await set(tempMessageRef, tempBotMessage);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const botReply = attachedFile
        ? await generateFileSummary(userMessage)
        : await generateContent(userMessage);
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

  const sendOrUpdateMessage = async () => {
    if (!message.trim()) return;
    if (editingMessageId) {
      const messageRef = ref(realTimeDb, `Users/${userId}/chatHistory/${editingMessageId}`);
      await update(messageRef, { text: message.trim() });
      const index = messages.findIndex((m) => m.id === editingMessageId);
      if (index !== -1 && messages[index + 1] && messages[index + 1].sender === "bot") {
        const botMessageId = messages[index + 1].id;
        const newReply = await generateContent(message.trim());
        const formattedReply = formatBotReply(newReply);
        const botMessageRef = ref(realTimeDb, `Users/${userId}/chatHistory/${botMessageId}`);
        await update(botMessageRef, { text: formattedReply });
      }
      setEditingMessageId(null);
      setEditingText("");
      setMessage("");
    } else {
      await sendMessage();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendOrUpdateMessage();
    }
  };

  const handleEditMessage = (msg) => {
    if (msg.sender === "user") {
      setEditingMessageId(msg.id);
      setEditingText(msg.text);
    }
  };

  const finishEditing = async (msgId) => {
    if (!editingText.trim()) return;
    const messageRef = ref(realTimeDb, `Users/${userId}/chatHistory/${msgId}`);
    await update(messageRef, { text: editingText.trim() });
    const index = messages.findIndex((m) => m.id === msgId);
    if (index !== -1 && messages[index + 1] && messages[index + 1].sender === "bot") {
      const botMessageId = messages[index + 1].id;
      const newReply = await generateContent(editingText.trim());
      const formattedReply = formatBotReply(newReply);
      const botMessageRef = ref(realTimeDb, `Users/${userId}/chatHistory/${botMessageId}`);
      await update(botMessageRef, { text: formattedReply });
    }
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("تم نسخ النص!"))
      .catch((err) => console.error("فشل النسخ: ", err));
  };

  const handleDeepThinking = async () => {
    if (!message.trim()) return;
    const userMessage = message.trim();
    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    const newMessage = {
      text: userMessage,
      sender: "user",
      timestamp: getCurrentTimestamp(),
    };
    const newMessageRef = push(chatHistoryRef);
    await set(newMessageRef, newMessage);
    setMessage("");
    try {
      const tempBotMessage = {
        text: "بيفكر بعمق...",
        sender: "bot",
        temporary: true,
        timestamp: getCurrentTimestamp(),
      };
      const tempMessageRef = push(chatHistoryRef);
      await set(tempMessageRef, tempBotMessage);
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

  const handleSaveMessage = async (msg) => {
    if (!userId) return;
    const savedMessagesRef = ref(realTimeDb, `Users/${userId}/savedMessages`);
    const newSavedMessageRef = push(savedMessagesRef);
    await set(newSavedMessageRef, msg);
  };

  const handleFavouriteMessage = async (msg) => {
    if (!userId) return;
    const favouriteMessagesRef = ref(realTimeDb, `Users/${userId}/favouriteMessages`);
    const newFavouriteMessageRef = push(favouriteMessagesRef);
    await set(newFavouriteMessageRef, msg);
  };

  const startNewChat = async () => {
    if (!userId) return;
    const chatHistoryRef = ref(realTimeDb, `Users/${userId}/chatHistory`);
    await remove(chatHistoryRef)
      .then(() => {
        console.log("تم مسح سجل الدردشة بنجاح");
        setMessages([]);
      })
      .catch((error) => {
        console.error("خطأ في مسح سجل الدردشة:", error);
      });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
      alert(`تم إرفاق الملف: ${file.name}. اكتب استفسارك عن الملف وسيتم تضمينه.`);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleTTS = async (text) => {
    if (!text) return;
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      return;
    }
    const segments = splitByLanguage(text);
    for (const seg of segments) {
      if (seg.lang === "ar") {
        await handleExternalTTS(seg.text);
      } else {
        const utterance = new SpeechSynthesisUtterance(seg.text);
        let voice = voices.find(v =>
          v.lang.toLowerCase().startsWith("en") ||
          v.name.toLowerCase().includes("english")
        );
        if (voice) {
          utterance.voice = voice;
        }
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
        await new Promise((resolve) => {
          utterance.onend = resolve;
        });
      }
    }
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = recognitionLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
  }

  const handleVoiceInput = () => {
    if (!recognition) {
      alert("متصفحك مش بيدعم التعرف الصوتي.");
      return;
    }
    if (isRecognizing) {
      recognition.stop();
      setIsRecognizing(false);
      return;
    }
    try {
      recognition.lang = recognitionLang;
      recognition.start();
      setIsRecognizing(true);
    } catch (err) {
      console.error("Error starting recognition:", err);
    }
  };

  if (recognition) {
    recognition.onresult = (event) => {
      const voiceText = event.results[0][0].transcript;
      setMessage(voiceText);
    };

    recognition.onerror = (event) => {
      console.error("خطأ في التعرف الصوتي: ", event.error);
      alert("حصل خطأ أثناء استخدام التعرف الصوتي.");
      setIsRecognizing(false);
    };

    recognition.onend = () => {
      setIsRecognizing(false);
    };
  }

  const toggleRecognitionLang = () => {
    setRecognitionLang((prevLang) => (prevLang === "ar-EG" ? "en-US" : "ar-EG"));
  };

  const isNewChat = messages.length === 0;

  return (
    <div className={darkMode ? styles.dark : styles.light}>
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <h2 className={styles.logo} onClick={() => navigate("/")}>Logo</h2>
        </div>
        <ul className={styles.nav_links}>
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
        </ul>
        <div className={styles.user_menu}>
          <div className={styles.user_icon} onClick={toggleDropdown}>
            <i className={`fas fa-${user ? "user" : "female"} fa-1x`}></i>
          </div>
          {showDropdown && (
            <div className={styles.dropdown_content}>
              <button
                type="button"
                className={styles.dropdownItem}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/manage-account");
                }}
              >
                Manage Account
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className={styles.dropdownItem}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className={`${styles.sidebar} ${sidebarOpen ? "" : styles.sidebarCollapsed}`}>
        <div className={styles.sidebarTop}>
          <button className={styles.sidebarBtn} onClick={toggleSidebar}>
            {sidebarOpen ? (
              <>
                <i className="fas fa-angle-double-left"></i>
                <span>Collapse</span>
              </>
            ) : (
              <i className="fas fa-angle-double-right"></i>
            )}
          </button>
          <button className={styles.sidebarBtn} onClick={startNewChat}>
            <i className="fas fa-plus"></i>
            {sidebarOpen && <span>New Chat</span>}
          </button>
        </div>
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

      <div className={`${styles.chatContainer} ${sidebarOpen ? styles.withSidebar : styles.fullWidth}`}>
        {isNewChat ? (
          <div className={styles.newChatCenter}>
            <h1 className={styles.newChatTitle}>What can I help with?</h1>
          </div>
        ) : (
          <div
            className={styles.messages}
            onScroll={handleScroll}
            ref={messagesContainerRef}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
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
                  <>
                    {editingMessageId === msg.id ? (
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => finishEditing(msg.id)}
                        onKeyPress={(e) => e.key === "Enter" && finishEditing(msg.id)}
                        className={styles.editInput}
                        autoFocus
                      />
                    ) : (
                      <p onDoubleClick={() => handleEditMessage(msg)}>{msg.text}</p>
                    )}
                  </>
                )}
                <div className={styles.messageActions}>
                  <button className={styles.saveButton} onClick={() => handleSaveMessage(msg)}>
                    <i className="fas fa-save"></i>
                  </button>
                  <button className={styles.favButton} onClick={() => handleFavouriteMessage(msg)}>
                    <i className="fas fa-star"></i>
                  </button>
                  {msg.sender === "user" && (
                    <button className={styles.editButton} onClick={() => handleEditMessage(msg)}>
                      <i className="fas fa-edit"></i>
                    </button>
                  )}
                  <button className={styles.copyButton} onClick={() => handleCopyText(msg.text)}>
                    <i className="fas fa-copy"></i>
                  </button>
                  {msg.sender === "bot" && (
                    <button className={styles.iconBtn} onClick={() => handleTTS(msg.text)}>
                      <i className="fas fa-volume-up"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {showScrollButton && (
          <button className={styles.scrollButton} onClick={scrollToBottom}>
            <i className="fas fa-chevron-down"></i>
          </button>
        )}

        <div className={styles.messageBox}>
          <button className={styles.iconBtn} onClick={handleAttachClick}>
            <i className="fas fa-paperclip"></i>
          </button>
          <button className={styles.iconBtn} onClick={handleVoiceInput}>
            <i className={`fas fa-microphone ${isRecognizing ? styles.recording : ""}`}></i>
          </button>
          <button className={styles.iconBtn} onClick={toggleRecognitionLang}>
            <i className="fas fa-language"></i>
          </button>
          <button className={styles.iconBtn} onClick={refreshVoices} title="تحديث الأصوات">
            <i className="fas fa-redo"></i>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="اكتب رسالتك..."
            className={styles.messageInput}
          />
          <button className={styles.iconBtn} onClick={() => handleTTS(message)}>
            <i className="fas fa-volume-up"></i>
          </button>
          <button className={styles.iconBtn} onClick={handleDeepThinking}>
            <i className="fas fa-brain"></i>
          </button>
          <button className={styles.sendBtn} onClick={sendOrUpdateMessage}>
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;