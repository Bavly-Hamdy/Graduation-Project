import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { Doughnut } from "react-chartjs-2";
import { auth } from "../../firebaseConfig"; // Firebase configuration
import { onAuthStateChanged } from "firebase/auth"; // Firebase auth state listener
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import peoplesImage from '../../assets/images/peoples.jpg'; // استيراد الصورة من داخل src/

ChartJS.register(ArcElement, Tooltip, Legend);

const Main = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // User state
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown state
  const [showScrollUp, setShowScrollUp] = useState(false); // Scroll-to-top button state

  // Pie chart data
  const [pieData, setPieData] = useState({
    labels: ["Segment 1", "Segment 2", "Segment 3", "Segment 4", "Segment 5"],
    datasets: [
      {
        data: [20, 15, 30, 25, 10],
        backgroundColor: [
          "#A0D6E8",
          "#A2C4E8",
          "#B6A1EA",
          "#CFA3E8",
          "#D09BC4",
        ],
        borderWidth: 0,
      },
    ],
  });

  // Pie chart options
  const options = {
    cutout: "50%",
    responsive: true,
    rotation: -90,
    circumference: 180,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataIndex = tooltipItem.dataIndex;
            const percentage = (
              (pieData.datasets[0].data[dataIndex] /
                pieData.datasets[0].data.reduce((a, b) => a + b)) *
              100
            ).toFixed(2);
            return `${pieData.labels[dataIndex]}: ${percentage}%`;
          },
        },
      },
    },
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  // Handle scroll for scroll-to-top button
  const handleScroll = () => {
    if (window.scrollY > 200) {
      setShowScrollUp(true);
    } else {
      setShowScrollUp(false);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User is logged in:", currentUser);
        setUser(currentUser);
      } else {
        console.log("No user is logged in");
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className={styles.main_container}>
      {/* Navbar Section */}
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

      {/* Welcome Message Section */}
      <section className={styles.welcome_section}>
        <div className={styles.welcome_message}>
          <h2>Welcome, {user ? user.displayName : "Guest"}!</h2>
          <p>Hope you're feeling better today!</p>
        </div>
        <img src={peoplesImage} alt="Welcome" className={styles.welcome_image} />
      </section>

      {/* Health Prediction Summary Section */}
      <section className={styles.summary_section}>
        <p>Here's a summary of your health prediction:</p>
      </section>

      {/* Pie Chart Section */}
      <section className={styles.chart_section}>
        <div className={styles.chart_container}>
          <Doughnut data={pieData} options={options} />
        </div>
      </section>

      {/* Reminder and Schedule Section */}
      <section className={styles.reminder_section}>
        <div className={styles.reminder_message}>
          <p>
            These are the nearest schedules for your medication and tests. Don't
            forget to take your meds and attend your tests. Healthcare will always
            remind you!
          </p>
        </div>
        <table className={styles.schedule_table}>
          <thead>
            <tr>
              <th>Medication/Test</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Blood Test</td>
              <td>2024-12-01</td>
              <td>10:00 AM</td>
            </tr>
            <tr>
              <td>Medication A</td>
              <td>2024-12-02</td>
              <td>08:00 AM</td>
            </tr>
            <tr>
              <td>Medication B</td>
              <td>2024-12-03</td>
              <td>12:00 PM</td>
            </tr>
            <tr>
              <td>Checkup</td>
              <td>2024-12-04</td>
              <td>03:00 PM</td>
            </tr>
            <tr>
              <td>Follow-up</td>
              <td>2024-12-05</td>
              <td>09:00 AM</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Scroll to Top Button */}
      {showScrollUp && (
        <button className={styles.scrollToTop} onClick={scrollToTop}>
          ↑
        </button>
      )}
    </div>
  );
};

export default Main;