import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; // استيراد updateProfile
import styles from "./styles.module.css";
import { auth } from "../../firebaseConfig"; // استيراد firebase auth

const Signup = () => {
  const [data, setData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    weight: "",
    gender: "",
    height: "",
    healthConditions: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      // استخدام Firebase Auth لإنشاء حساب جديد
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // تحديث اسم المستخدم
      await updateProfile(user, { displayName: data.fullName });
      
      navigate("/login");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.signup_container}>
      <div className={styles.signup_form_container}>
        <div className={styles.left}>
          <h1>Welcome Back</h1>
          <Link to="/login">
            <button type="button" className={styles.white_btn}>
              Sign in
            </button>
          </Link>
        </div>
        <div className={styles.right}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Create Account</h1>
            <input 
              type="text" 
              placeholder="Full Name" 
              name="fullName" 
              onChange={handleChange} 
              value={data.fullName} 
              required 
              className={styles.input} 
            />
            <input 
              type="email" 
              placeholder="Email" 
              name="email" 
              onChange={handleChange} 
              value={data.email} 
              required 
              className={styles.input} 
            />
            <div className={styles.password_container}>
              <input 
                type="password" 
                placeholder="Password" 
                name="password" 
                onChange={handleChange} 
                value={data.password} 
                required 
                className={styles.input} 
              />
              <input 
                type="password" 
                placeholder="Confirm Password" 
                name="confirmPassword" 
                onChange={handleChange} 
                value={data.confirmPassword} 
                required 
                className={styles.input} 
              />
            </div>
            <div className={styles.age_gender_container}>
              <input 
                type="number" 
                placeholder="Age" 
                name="age" 
                onChange={handleChange} 
                value={data.age} 
                required 
                className={styles.input} 
              />
              <select 
                name="gender" 
                onChange={handleChange} 
                value={data.gender} 
                required 
                className={styles.input}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className={styles.weight_height_container}>
              <input 
                type="number" 
                placeholder="Weight (kg)" 
                name="weight" 
                onChange={handleChange} 
                value={data.weight} 
                required 
                className={styles.input} 
              />
              <input 
                type="number" 
                placeholder="Height (cm)" 
                name="height" 
                onChange={handleChange} 
                value={data.height} 
                required 
                className={styles.input} 
              />
            </div>
            <textarea 
              placeholder="Health Conditions (if any)" 
              name="healthConditions" 
              onChange={handleChange} 
              value={data.healthConditions} 
              className={styles.textarea}
            />
            {error && <div className={styles.error_msg}>{error}</div>}
            <button type="submit" className={styles.green_btn}>Sign Up</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;