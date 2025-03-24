import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AboutProject.css"; // استخدام ملف CSS العادي
import dots from "../../assets/images/dots-1.png";
import doctor from "../../assets/images/doctor.avif";

const AboutProject = () => {
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const toggleReadMore = () => {
    setShowMore((prev) => !prev);
  };

  return (
    <div className="light">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo" onClick={() => navigate("/")}>
          Logo
        </h1>
        <ul className="nav_links">
          <li onClick={() => navigate("/chatbot")}>Chatbot</li>
          <li onClick={() => navigate("/reminder")}>Reminder</li>
          <li onClick={() => navigate("/plan")}>Plan & Bay Chart</li>
          <li onClick={() => navigate("/about")}>About Us</li>
          <li onClick={() => navigate("/contact")}>Contact Us</li>
        </ul>
        <div className="user_menu">
          <div className="user_icon">
            <i className="fas fa-user fa-1x"></i>
          </div>
        </div>
      </nav>

      {/* About Content */}
      <div className="container">
        {/* Text Section */}
        <div className="textSection">
          <h1>About Project</h1>
          <p>
            We provide a comprehensive AI-based healthcare system designed to deliver fast and effective medical solutions.
            Through medication reminders, symptom tracking, and health data analysis, we ensure precise and integrated healthcare.
            Our goal is to simplify communication between patients and healthcare providers.
          </p>
          <div className={`extraText ${showMore ? "open" : ""}`}>
            <p>
              Our services cover a complete range—from software solutions to cutting-edge wearable devices—ensuring you receive the best in modern healthcare.
            </p>
            <p>
              We also offer customized solutions for individuals with special needs by tailoring the website, fonts, and colors to suit the specific requirements of the elderly and people with disabilities.
            </p>
            <p>
              We follow your health condition step by step, providing continuous monitoring and support.
            </p>
            <p>
              Our system makes it easier for doctors to track your health by providing a comprehensive summary of all your health data, measurements, and information.
            </p>
            <p>
              We are three students from King Salman International University, Al-Tour Branch, Faculty of Computer Science.
              Recognizing the lack of comprehensive healthcare for our elders and people with special needs, we aim to provide trustworthy, integrated, and free healthcare solutions.
              We truly believe in spreading mercy through knowledge.
            </p>
          </div>
          <button onClick={toggleReadMore}>
            {showMore ? "Read Less" : "Read More"}
          </button>
        </div>

        {/* Image Section */}
        <div className="imageSection">
          <img src={doctor} alt="Peoples" className="peopleImg" />
          <img src={dots} alt="Dots" className="dotsImg" />
        </div>
      </div>
    </div>
  );
};

export default AboutProject;