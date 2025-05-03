import React, { useState, useEffect } from "react";
import styles from "./ManageAccount.module.css";
import { auth, realTimeDb, ref, update, get } from "../../firebaseConfig";
import {
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";

const ManageAccount = ({ user, onClose }) => {
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
    confirmNewPassword: "",
  });
  const [step, setStep] = useState("profile");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const userRef = ref(realTimeDb, `Users/${user.uid}`);
      const snap = await get(userRef);
      if (snap.exists()) setUserData(snap.val());
    };
    fetchData();
  }, [user]);

  const handleInputChange = (field, value) =>
    setUserData((prev) => ({ ...prev, [field]: value }));

  const saveProfile = async () => {
    try {
      const userRef = ref(realTimeDb, `Users/${user.uid}`);
      await update(userRef, userData);
      if (user.email !== userData.email) {
        await updateEmail(user, userData.email);
      }
      alert("Profile updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const changePassword = async () => {
    const { oldPassword, newPassword, confirmNewPassword } = passwordData;
    if (newPassword !== confirmNewPassword)
      return alert("Passwords do not match.");
    const cred = EmailAuthProvider.credential(user.email, oldPassword);
    try {
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      alert("Password changed!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <div className={styles.popup_overlay}>
      <div className={styles.popup_content}>
        <button className={styles.close_button} onClick={onClose}>×</button>
        {step === "profile" ? (
          <>
            <h2>Manage Account</h2>
            {Object.entries(userData).map(([key, val]) => (
              <div key={key} className={styles.field}>
                <label>{key}</label>
                <input
                  value={val}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                />
              </div>
            ))}
            <div className={styles.button_row}>
              <button onClick={saveProfile}>Save</button>
              <button onClick={() => setStep("password")}>Change Password</button>
            </div>
          </>
        ) : (
          <>
            <h2>Change Password</h2>
            {['oldPassword', 'newPassword', 'confirmNewPassword'].map(field => (
              <div key={field} className={styles.field}>
                <label>{field}</label>
                <input
                  type="password"
                  value={passwordData[field]}
                  onChange={e =>
                    setPasswordData(prev => ({
                      ...prev,
                      [field]: e.target.value
                    }))
                  }
                />
              </div>
            ))}
            <div className={styles.button_row}>
              <button onClick={changePassword}>Save Password</button>
              <button onClick={() => setStep('profile')}>Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageAccount;