import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Reminder.module.css';
import { FaPlus, FaBell, FaFilePdf, FaTrash, FaEdit } from 'react-icons/fa';

const notificationSound = new Audio('/Reminder.mp3'); // تأكد من المسار الصحيح

const AddReminderModal = ({ isOpen, onClose, onAdd, reminderToEdit }) => {
  const [medication, setMedication] = useState(reminderToEdit ? reminderToEdit.medication : '');
  const [date, setDate] = useState(reminderToEdit ? reminderToEdit.date : '');
  const [time, setTime] = useState(reminderToEdit ? reminderToEdit.time : '');

  const handleSubmit = () => {
    onAdd({ medication, date, time, taken: reminderToEdit ? reminderToEdit.taken : false });
    onClose();
  };

  useEffect(() => {
    setMedication(reminderToEdit ? reminderToEdit.medication : '');
    setDate(reminderToEdit ? reminderToEdit.date : '');
    setTime(reminderToEdit ? reminderToEdit.time : '');
  }, [reminderToEdit]);

  if (!isOpen) return null;

  return (
    <div className={styles.modal}>
      <h3>{reminderToEdit ? 'Edit Reminder' : 'Add Reminder'}</h3>
      <input 
        type="text" 
        placeholder="Medication/Test" 
        value={medication} 
        onChange={(e) => setMedication(e.target.value)} 
      />
      <input 
        type="date" 
        value={date} 
        onChange={(e) => setDate(e.target.value)} 
      />
      <input 
        type="time" 
        value={time} 
        onChange={(e) => setTime(e.target.value)} 
      />
      <button onClick={handleSubmit}>{reminderToEdit ? 'Update' : 'Add'}</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

const Reminder = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState(() => {
    const savedReminders = localStorage.getItem('reminders');
    return savedReminders ? JSON.parse(savedReminders) : [];
  });
  const [nextReminders, setNextReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications === 'true';
  });
  const [reminderToEdit, setReminderToEdit] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    localStorage.setItem('reminders', JSON.stringify(reminders));
    updateNextReminders();
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('notifications', notificationEnabled);
    if (notificationEnabled) {
      const interval = setInterval(() => {
        checkReminders();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [notificationEnabled, reminders, nextReminders]);

  const updateNextReminders = () => {
    const now = new Date();
    const upcoming = reminders.filter(reminder => {
      const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
      return reminderDate > now && !reminder.taken; 
    });
    setNextReminders(upcoming);
  };

  const checkReminders = () => {
    const now = new Date();
    nextReminders.forEach(reminder => {
      const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
      if (reminderDate <= now && !reminder.taken) {
        notificationSound.play();
        alert(`It's time to take your medication: ${reminder.medication}`);
        reminder.taken = true; 
        updateNextReminders();
      }
    });
  };

  const handleAddOrUpdateReminder = (reminder) => {
    if (reminderToEdit) {
      const updatedReminders = reminders.map((r, index) => 
        index === reminderToEdit.index ? reminder : r
      );
      setReminders(updatedReminders);
      setReminderToEdit(null);
    } else {
      setReminders([...reminders, reminder]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteReminder = (index) => {
    const updatedReminders = reminders.filter((_, i) => i !== index);
    setReminders(updatedReminders);
  };

  const handleEditReminder = (index) => {
    setReminderToEdit({ ...reminders[index], index });
    setIsModalOpen(true);
  };

  const toggleTaken = (index) => {
    const updatedReminders = [...nextReminders];
    updatedReminders[index].taken = !updatedReminders[index].taken;
    setNextReminders(updatedReminders);
    updateNextReminders();
  };

  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className={styles.reminderContainer}>
      <nav className={styles.navbar}>
        <h1 className={styles.logo} onClick={() => navigate("/")}>Logo</h1>
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

      <h2 className={styles.title}>Medication Reminder</h2>
      
      <table className={styles.reminderTable}>
        <thead>
          <tr>
            <th>Medication/Test</th>
            <th>Date</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reminders.map((reminder, index) => (
            <tr key={index}>
              <td>{reminder.medication}</td>
              <td>{reminder.date}</td>
              <td>{reminder.time}</td>
              <td>
                <button onClick={() => handleEditReminder(index)}><FaEdit /></button>
                <button onClick={() => handleDeleteReminder(index)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className={styles.title}>Next Reminders</h3>
      <table className={styles.reminderTable}>
        <thead>
          <tr>
            <th>Medication/Test</th>
            <th>Date</th>
            <th>Time</th>
            <th>Taken</th>
          </tr>
        </thead>
        <tbody>
          {nextReminders.map((reminder, index) => (
            <tr key={index}>
              <td>{reminder.medication}</td>
              <td>{reminder.date}</td>
              <td>{reminder.time}</td>
              <td>
                <input 
                  type="checkbox" 
                  checked={reminder.taken} 
                  onChange={() => toggleTaken(index)} 
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.actions}>
        <button onClick={handleNotificationToggle}>
          <FaBell /> {notificationEnabled ? 'Disable Notifications' : 'Enable Notifications'}
        </button>
        <button onClick={handlePrint}>
          <FaFilePdf /> Print PDF
        </button>
        <button onClick={() => setIsModalOpen(true)}>
          <FaPlus /> Add Reminder
        </button>
      </div>

      {isModalOpen && 
        <AddReminderModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onAdd={handleAddOrUpdateReminder} 
          reminderToEdit={reminderToEdit} 
        />
      }
    </div>
  );
};

export default Reminder;