import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ContactUs.css";

const ContactUs = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // استخدام mailto لفتح العميل البريدي مع ملء الموضوع والمحتوى
    window.location.href = `mailto:bavly.morgan2030@gmail.com?subject=Contact from ${formData.name}&body=${formData.message}`;
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

      {/* Contact Form Container */}
      <div className="contact-container">
        <div className="contact-form">
          <h2>Contact Us</h2>
          <p>
            If you have any questions or need more information, feel free to send us a message.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
            <button type="submit">Send Email</button>
          </form>
          <div className="contact-options">
            <p>Or contact us via WhatsApp:</p>
            <a
              href="https://wa.me/201070299203"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;