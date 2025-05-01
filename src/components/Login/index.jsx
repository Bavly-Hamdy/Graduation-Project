import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle } from '@fortawesome/free-brands-svg-icons';
import styles from "./styles.module.css";
import { auth, googleProvider, facebookProvider } from "../../firebaseConfig";

const Login = () => {
  const [data, setData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = ({ currentTarget: input }) => {
    setData({ ...data, [input.name]: input.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      localStorage.setItem("token", "firebase_token");
      navigate("/"); // Only navigate if login succeeds
    } catch (error) {
      setError(error.message); // Stay on login page if login fails
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.setItem("token", "firebase_token");
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      localStorage.setItem("token", "firebase_token");
      navigate("/");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.login_container}>
      <div className={styles.login_form_container}>
        <div className={styles.left}>
          <form className={styles.form_container} onSubmit={handleSubmit}>
            <h1>Login to Your Account</h1>

            <input 
              type="email" 
              placeholder="Email" 
              name="email" 
              onChange={handleChange} 
              value={data.email} 
              required 
              className={styles.input} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              name="password" 
              onChange={handleChange} 
              value={data.password} 
              required 
              className={styles.input} 
            />

            {error && <div className={styles.error_msg}>{error}</div>}

            <button type="submit" className={styles.green_btn}>Sign In</button>

            <Link to="/forgot-password" className={styles.forgot_password}>Forgot Password?</Link>
          </form>

          <div className={styles.social_login}>
            <button className={styles.social_btn} onClick={handleFacebookLogin}>
              <FontAwesomeIcon icon={faFacebook} /> &nbsp; Login with Facebook
            </button>
            <button className={styles.social_btn} onClick={handleGoogleLogin}>
              <FontAwesomeIcon icon={faGoogle} /> &nbsp; Login with Google
            </button>
          </div>
        </div>

        <div className={styles.right}>
          <h1>New Here?</h1>
          <Link to="/signup">
            <button type="button" className={styles.white_btn}>Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
