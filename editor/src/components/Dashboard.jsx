import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

import WebMessages from "./WebMessages";
import UploadGallery from "./UploadGallery";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      alert("Failed to logout");
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="website-name">Fleur Admin Dashboard</h1>
          <p className="logged-user">
            Logged in as: <strong>{user?.email}</strong>
          </p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <UploadGallery />
      <WebMessages />
    </div>
  );
};

export default Dashboard;
