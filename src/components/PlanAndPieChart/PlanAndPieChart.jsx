import { useEffect, useState } from "react";
import Modal from "react-modal";
import jsPDF from "jspdf";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { Doughnut, Bar } from "react-chartjs-2";
import { realTimeDb, auth } from "../../firebaseConfig"; // Import realTimeDb and auth
import { ref, onValue, set } from "firebase/database"; // Import Firebase Realtime Database functions
import { onAuthStateChanged } from "firebase/auth";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const PlanAndPieChart = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [sugarLevel, setSugarLevel] = useState(0);
  const [dailyPlan, setDailyPlan] = useState([]);
  const [healthIndicator, setHealthIndicator] = useState(0);

  // Options for the Pie chart
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
          label: (tooltipItem) => {
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

  const toggleDropdown = () => {
    setShowDropdown((prevState) => !prevState);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleAddSugarTest = () => {
    setModalContent(
      <div>
        <label htmlFor="sugarLevelInput">Enter Sugar Level:</label>
        <input
          type="number"
          id="sugarLevelInput"
          value={sugarLevel || ''}
          onChange={(e) => setSugarLevel(e.target.value === '' ? '' : parseInt(e.target.value))}
          placeholder="Enter your sugar level"
          min="1"
        />
        <button
          onClick={async () => {
            if (isNaN(sugarLevel) || sugarLevel <= 0) {
              alert("Please enter a valid sugar level.");
              return;
            }

            // Save sugar level to Firebase Realtime Database
            const sugarLevelRef = ref(realTimeDb, `Users/${user.uid}/sugarLevel`);
            try {
              await set(sugarLevelRef, sugarLevel); // Use `set` from Firebase Realtime Database
              alert("Sugar level added successfully!");
              setShowModal(false);
            } catch (error) {
              console.error("Error adding sugar level: ", error);
            }
          }}
        >
          Add Sugar Test
        </button>
      </div>
    );
    setShowModal(true);
  };

  const generateDailyPlan = () => {
    const plan = [
      { time: "8:00 AM", task: "Take medicine A" },
      { time: "12:00 PM", task: "Eat healthy lunch" },
      { time: "6:00 PM", task: "Take medicine B" },
    ];
    setDailyPlan(plan);
    setModalContent(
      <ul>
        {plan.map((item, index) => (
          <li key={index}>{`${item.time}: ${item.task}`}</li>
        ))}
      </ul>
    );
    setShowModal(true);
  };

  const calculateHealthIndicator = () => {
    const indicator = Math.random() * 100; // Example calculation
    setHealthIndicator(indicator.toFixed(2));
    setModalContent(<p>Health Indicator: {indicator.toFixed(2)}%</p>);
    setShowModal(true);
  };

  const printPatientInfo = async () => {
    if (!user) {
      alert("No user logged in!");
      return;
    }

    console.log("Fetching user data from Firebase Realtime Database...");

    // Fetch user data from Firebase Realtime Database
    const userRef = ref(realTimeDb, `Users/${user.uid}`);
    onValue(userRef, (snapshot) => {
      const userData = snapshot.val();
      console.log("User data fetched:", userData);

      if (userData) {
        // Generate PDF
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text("Patient Information", 10, 10);
        doc.setFontSize(12);
        doc.text(`Full Name:${userData.fullName}`, 10, 20);
        doc.text(`Email: ${userData.email}`, 10, 30);
        doc.text(`Age: ${userData.age}`, 10, 40);
        doc.text(`Gender: ${userData.gender}`, 10, 50);
        doc.text(`Height: ${userData.height}cm`, 10, 60);
        doc.text(`Weight: ${userData.weight} kg`, 10, 70);
        doc.text(`Health Conditions: ${userData.healthConditions}`, 10, 80);
        doc.save("patient_info.pdf");
      }
    }, {
      onlyOnce: true, // Fetch data only once
    });
  };

  return (
    <div className={styles.main_container}>
      {/* Navbar Section */}
      <nav className={styles.navbar}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>Logo</h1>
        <ul className={styles.nav_links}>
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/reminder")}>Reminder</li>
          <li onClick={() => navigate("/plan")}>Plan & Pie Chart</li>
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

      {/* Pie Chart Section */}
      <section className={styles.chart_section}>
        <h2>Pie Chart</h2>
        <div className={styles.chart_container}>
          <Doughnut data={pieData} options={options} />
        </div>
      </section>

      {/* Buttons Section */}
      <div className={styles.buttons_container}>
        <button className={styles.button} onClick={() => {
          setModalContent(<p>Daily summary and warnings will be here!</p>);
          setShowModal(true);
        }}>Daily Summary 🤖</button>
        <button className={styles.button} onClick={() => {
          setModalContent(<Bar data={pieData} options={options} />);
          setShowModal(true);
        }}>Detailed Chart</button>
        <button className={styles.button} onClick={printPatientInfo}>Print Patient Info</button>
        <button className={styles.button} onClick={calculateHealthIndicator}>Health Indicator</button>
        <button className={styles.button} onClick={generateDailyPlan}>Daily Plan</button>
        <button className={styles.button} onClick={handleAddSugarTest}>Add Sugar Test</button>
      </div>

      {/* Modal Section */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="Popup Modal"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <button onClick={() => setShowModal(false)} className={styles.close_button}>X</button>
        {modalContent}
      </Modal>

      {/* Footer Section */}
      <footer className={styles.footer}>
        <p>Copyright &copy; 2025</p>
      </footer>
    </div>
  );
};

export default PlanAndPieChart;