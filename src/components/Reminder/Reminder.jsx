import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Reminder.module.css';
import { FaPlus, FaBell, FaFilePdf, FaTrash, FaEdit } from 'react-icons/fa';
import { realTimeDb, auth } from '../../firebaseConfig'; // Import realTimeDb and auth
import { ref, push, set, onValue, remove, update } from 'firebase/database';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const notificationSound = new Audio('/Reminder.mp3'); // Ensure the path is correct

const AddReminderModal = ({ isOpen, onClose, onAdd, reminderToEdit }) => {
  const [medication, setMedication] = useState(reminderToEdit ? reminderToEdit.medication : '');
  const [date, setDate] = useState(reminderToEdit ? reminderToEdit.date : '');
  const [time, setTime] = useState(reminderToEdit ? reminderToEdit.time : '');

  const handleSubmit = () => {
    onAdd({ medication, date, time, taken: false }); // New reminders are not taken by default
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
  const [reminders, setReminders] = useState([]);
  const [nextReminders, setNextReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    const savedNotifications = localStorage.getItem('notifications');
    return savedNotifications === 'true';
  });
  const [reminderToEdit, setReminderToEdit] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  // Fetch reminders from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const remindersRef = ref(realTimeDb, `reminders/${currentUser.uid}`); // Use realTimeDb
        onValue(remindersRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const remindersList = Object.keys(data).map(key => ({
              id: key,
              ...data[key]
            }));
            setReminders(remindersList);
            updateNextReminders(remindersList); // Update next reminders
          } else {
            setReminders([]);
            setNextReminders([]);
          }
        });
      } else {
        setUser(null);
        setReminders([]);
        setNextReminders([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Update next reminders
  const updateNextReminders = (remindersList) => {
    const now = new Date();
    const upcoming = remindersList.filter(reminder => {
      const reminderDate = new Date(`${reminder.date}T${reminder.time}`);
      return reminderDate > now && !reminder.taken; // Only show upcoming and not taken reminders
    });
    setNextReminders(upcoming);
  };

  // Save reminders to Firebase
  const handleAddOrUpdateReminder = (reminder) => {
    if (user) {
      const remindersRef = ref(realTimeDb, `reminders/${user.uid}`); // Use realTimeDb
      if (reminderToEdit) {
        const reminderRef = ref(realTimeDb, `reminders/${user.uid}/${reminderToEdit.id}`); // Use realTimeDb
        update(reminderRef, reminder);
      } else {
        push(remindersRef, {
          ...reminder,
          addedBy: user.displayName || user.email,
        });
      }
      setIsModalOpen(false);
      setReminderToEdit(null);
    }
  };

  // Delete reminder from Firebase
  const handleDeleteReminder = (id) => {
    if (user) {
      const reminderRef = ref(realTimeDb, `reminders/${user.uid}/${id}`); // Use realTimeDb
      remove(reminderRef);
    }
  };

  // Edit reminder
  const handleEditReminder = (id) => {
    const reminder = reminders.find(r => r.id === id);
    setReminderToEdit(reminder);
    setIsModalOpen(true);
  };

  // Toggle taken status
  const toggleTaken = (id) => {
    if (user) {
      const reminderRef = ref(realTimeDb, `reminders/${user.uid}/${id}`); // Use realTimeDb
      const reminder = reminders.find(r => r.id === id);
      const updatedReminder = { ...reminder, taken: !reminder.taken };
      update(reminderRef, { taken: updatedReminder.taken });
      setReminders(prevReminders =>
        prevReminders.map(r => (r.id === id ? updatedReminder : r))
      );
      updateNextReminders(reminders.map(r => (r.id === id ? updatedReminder : r))); // Update next reminders
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle logout
  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
      navigate('/login'); // Redirect to login page after logout
    }).catch((error) => {
      console.error("Error logging out:", error);
    });
  };

  // Toggle notifications
  const handleNotificationToggle = () => {
    setNotificationEnabled(!notificationEnabled);
    localStorage.setItem('notifications', !notificationEnabled);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
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
      
      {/* All Reminders Table */}
      <table className={styles.reminderTable}>
        <thead>
          <tr>
            <th>Medication/Test</th>
            <th>Date</th>
            <th>Time</th>
            <th>Added By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reminders.map((reminder) => (
            <tr key={reminder.id}>
              <td>{reminder.medication}</td>
              <td>{reminder.date}</td>
              <td>{reminder.time}</td>
              <td>{reminder.addedBy}</td>
              <td>
                <button onClick={() => handleEditReminder(reminder.id)}><FaEdit /></button>
                <button onClick={() => handleDeleteReminder(reminder.id)}><FaTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Next Reminders Table */}
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
                  onChange={() => toggleTaken(reminder.id)} 
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