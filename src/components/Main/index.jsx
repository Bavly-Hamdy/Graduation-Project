import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { auth, realTimeDb, ref, get, update } from "../../firebaseConfig";
import { onAuthStateChanged, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import peoplesImage from '../../assets/images/peoples.jpg';
import dotsImage from '../../assets/images/dots-1.png';
import insights from '../../assets/images/2.png';
import tracking from '../../assets/images/Tracking.jpg';
import assistant from '../../assets/images/1.webp'

const Main = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showManagePopup, setShowManagePopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    age: "",
    height: "",
    weight: "",
    birthDate: "",
    email: "",
    healthCondition: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: ""
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUserData(currentUser.uid);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userRef = ref(realTimeDb, `Users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  const handleInputChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!user) return;

    try {
      const userRef = ref(realTimeDb, `Users/${user.uid}`);
      await update(userRef, userData);

      if (user.email !== userData.email) {
        await updateEmail(user, userData.email);
      }

      alert("Profile updated successfully!");
      setShowManagePopup(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  const openPasswordPopup = () => {
    setShowPasswordPopup(true);
    setShowManagePopup(false);
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    const { oldPassword, newPassword, confirmNewPassword } = passwordData;

    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }

    const credential = EmailAuthProvider.credential(user.email, oldPassword);

    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert("Password updated successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmNewPassword: "" });
      setShowPasswordPopup(false);
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password: " + error.message);
    }
  };

  return (
    <div className={styles.main_container}>
      <nav className={styles.navbar}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>Logo</h1>
        <ul className={styles.nav_links}>
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
        </ul>
        <div className={styles.user_menu} onClick={toggleDropdown}>
          <div className={styles.user_icon}>
            <i className={`fas fa-${user ? "user" : "female"} fa-1x`}></i>
          </div>
          {showDropdown && (
            <div className={styles.dropdown_content}>
              <button onClick={() => { setShowManagePopup(true); setShowDropdown(false); }} className={styles.dropdown_button}>
                Manage Account
              </button>
              <button onClick={handleLogout} className={styles.dropdown_button}>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      <section className={styles.welcome_section}>
        <h1 className={styles.main_title}>AI-Powered Integrated Healthcare Assistant</h1>
        <div className={styles.welcome_message}>
          <h2>Welcome, {userData.fullName || user?.displayName || "Guest"}!</h2>
          <p>Hope you're feeling better today!</p>
          <button className={styles.explore_button}>Explore Now</button>
        </div>
        <img src={peoplesImage} alt="Welcome" className={styles.welcome_image} />
        <img src={dotsImage} alt="Dots" className={styles.dots_image} />
      </section>

      {/* About Application Section */}
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

      {/* Manage Account Popup */}
      {showManagePopup && (
        <div className={styles.popup_overlay}>
          <div className={styles.popup_content}>
            <h2>Manage Account</h2>

            {/* Form Fields */}
            <div className={styles.field}><label>Full Name</label><input value={userData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} /></div>
            <div className={styles.field}><label>Age</label><input value={userData.age} onChange={(e) => handleInputChange("age", e.target.value)} /></div>
            <div className={styles.field}><label>Height (cm)</label><input value={userData.height} onChange={(e) => handleInputChange("height", e.target.value)} /></div>
            <div className={styles.field}><label>Weight (kg)</label><input value={userData.weight} onChange={(e) => handleInputChange("weight", e.target.value)} /></div>
            <div className={styles.field}><label>Birth Date</label><input value={userData.birthDate} onChange={(e) => handleInputChange("birthDate", e.target.value)} /></div>
            <div className={styles.field}><label>Email</label><input value={userData.email} onChange={(e) => handleInputChange("email", e.target.value)} /></div>
            <div className={styles.field}><label>Health Condition</label><input value={userData.healthCondition} onChange={(e) => handleInputChange("healthCondition", e.target.value)} /></div>

            <div className={styles.button_row}>
              <button className={styles.save_button} onClick={handleSaveChanges}>Save Changes</button>
              <button className={styles.change_password_button} onClick={openPasswordPopup}>Change Password</button>
              <button className={styles.close_button} onClick={() => setShowManagePopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Popup */}
      {showPasswordPopup && (
        <div className={styles.popup_overlay}>
          <div className={styles.popup_content}>
            <h2>Change Password</h2>

            <div className={styles.field}><label>Old Password</label><input type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} /></div>
            <div className={styles.field}><label>New Password</label><input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} /></div>
            <div className={styles.field}><label>Confirm New Password</label><input type="password" value={passwordData.confirmNewPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })} /></div>

            <div className={styles.button_row}>
              <button className={styles.save_button} onClick={handlePasswordChange}>Save Password</button>
              <button className={styles.close_button} onClick={() => setShowPasswordPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Main;
