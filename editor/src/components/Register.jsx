import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { Link,useNavigate } from "react-router-dom";
import "./Auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    username: "",
    email: "",
    cellphone: "",
    websiteRef: "",
    password: "",
  });

  const navigate = useNavigate(); // ✅ define navigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Store extra user info in Firestore
      await setDoc(doc(db, "Users", user.uid), {
        name: formData.name,
        surname: formData.surname,
        username: formData.username,
        email: formData.email,
        cellphone: formData.cellphone,
        websiteRef: formData.websiteRef,
        createdAt: serverTimestamp(),
      });

      navigate("/dashboard"); 
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleRegister}>
        <h2>Create Account</h2>

        <input name="name" placeholder="Name" onChange={handleChange} required />
        <input name="surname" placeholder="Surname" onChange={handleChange} required />
        <input name="username" placeholder="Username" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <input name="cellphone" placeholder="Cellphone" onChange={handleChange} required />
        <input name="websiteRef" placeholder="Website Reference" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

        <button type="submit">Create Account</button>

        {/* Switch to Login */}
        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login" className="auth-link">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
