// src/components/Main/index.jsx
import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import ManageAccount from "../ManageAccount/ManageAccount"; // عدّل المسار حسب موقع الملف

// صور الصفحه
import peoplesImage from "../../assets/images/peoples.jpg";
import dotsImage from "../../assets/images/dots-1.png";
import insights from "../../assets/images/2.png";
import tracking from "../../assets/images/Tracking.jpg";
import assistant from "../../assets/images/1.webp";

const Main = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManage, setShowManage] = useState(false);

  // نتأكد من تسجيل الدخول
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={styles.main_container}>
      {/* الـ Navbar */}
      <nav className={styles.navbar}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>
          Logo
        </h1>
        <ul className={styles.nav_links}>
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
        </ul>
        <div className={styles.user_menu} onClick={() => setShowDropdown((p) => !p)}>
          <div className={styles.user_icon}>
            <i className="fas fa-user fa-1x"></i>
          </div>
          {showDropdown && (
            <div className={styles.dropdown_content}>
              <button
                onClick={() => {
                  setShowManage(true);
                  setShowDropdown(false);
                }}
                className={styles.dropdown_button}
              >
                Manage Account
              </button>
              <button onClick={handleLogout} className={styles.dropdown_button}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* قسم الترحيب */}
      <section className={styles.welcome_section}>
        <h1 className={styles.main_title}>AI-Powered Integrated Healthcare Assistant</h1>
        <div className={styles.welcome_message}>
          <h2>Welcome, {user?.displayName || "Guest"}!</h2>
          <p>Hope you're feeling better today!</p>
          <button className={styles.explore_button}>Explore Now</button>
        </div>
        <img src={peoplesImage} alt="Welcome" className={styles.welcome_image} />
        <img src={dotsImage} alt="Dots" className={styles.dots_image} />
      </section>

      {/* قسم عن التطبيق */}
      <section className={styles.application_section}>
        <h2 className={styles.application_header}>About Application</h2>
        <div className={styles.application_content}>
          <div className={styles.text_part}>
            <p>
              Experience the future of healthcare with our AI-Powered Integrated Healthcare Assistant.
              Get personalized insights, track your health progress, and receive expert guidance — all designed
              to empower you on your journey to better well-being. Join thousands who are transforming
              their health with the support of technology!
            </p>
            <button className={styles.learn_more_button}>Learn More</button>
          </div>
          <div className={styles.image_part}>
            <img src={peoplesImage} alt="Healthcare Application" />
          </div>
        </div>
      </section>

      {/* ميزات التطبيق */}
      <section className={styles.features_section}>
        <h2 className={styles.features_header}>Discover Our Features</h2>
        <div className={styles.features_grid}>
          <div className={styles.feature_card}>
            <img src={insights} alt="Personalized Insights" className={styles.card_image} />
            <h3>Personalized Insights</h3>
            <p>Tailored health recommendations based on your personal data and goals.</p>
          </div>
          <div className={styles.feature_card}>
            <img src={assistant} alt="Virtual Assistant" className={styles.card_image} />
            <h3>24/7 Virtual Assistant</h3>
            <p>Immediate health support whenever you need it, powered by AI.</p>
          </div>
          <div className={styles.feature_card}>
            <img src={tracking} alt="Progress Tracking" className={styles.card_image} />
            <h3>Health Progress Tracking</h3>
            <p>Monitor your improvements and achieve milestones efficiently.</p>
          </div>
        </div>
      </section>

      {/* استدعاء مكون إدارة الحساب */}
      {showManage && <ManageAccount user={user} onClose={() => setShowManage(false)} />}

    </div>
  );
};

export default Main;
