import { useEffect, useState } from "react";
import Modal from "react-modal";
import jsPDF from "jspdf";
import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { Doughnut, Bar } from "react-chartjs-2";
import { auth } from "../../firebaseConfig";
import { getFirestore, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
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
          value={sugarLevel || ''}  // تأكد من أن القيمة ستظهر بشكل صحيح
          onChange={(e) => setSugarLevel(e.target.value === '' ? '' : parseInt(e.target.value))}  // تعيين القيمة المدخلة بشكل صحيح
          placeholder="Enter your sugar level"
          min="1"  // تأكد من أن القيمة تكون أكبر من 0
        />
        <button
          onClick={async () => {
            // تحقق من أن مستوى السكر المدخل صالح
            if (isNaN(sugarLevel) || sugarLevel <= 0) {
              alert("Please enter a valid sugar level.");
              return; // إيقاف التنفيذ إذا كانت القيمة غير صالحة
            }
  
            const docRef = doc(db, "patients", user.uid);
            try {
              await setDoc(docRef, { sugarLevel }, { merge: true });
              alert("Sugar level added successfully!");
              setShowModal(false);  // إغلاق النافذة بعد إضافة السكر
            } catch (error) {
              console.error("Error adding sugar level: ", error);
            }
          }}
        >
          Add Sugar Test
        </button>
      </div>
    );
    setShowModal(true);  // فتح النافذة المنبثقة
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
    const docRef = doc(db, "patients", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const doc = new jsPDF();
      doc.text("Patient Information", 10, 10);
      doc.text(`Name: ${data.name}`, 10, 20);
      doc.text(`Age: ${data.age}`, 10, 30);
      doc.text(`Sugar Level: ${data.sugarLevel || "N/A"}`, 10, 40);
      doc.save("patient_info.pdf");
    } else {
      alert("No patient data found!");
    }
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
