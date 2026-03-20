// src/components/TopNav.jsx
import React from "react";

export default function TopNav({ currentView, setCurrentView }) {
  const navItems = ["Websites", "Account", "Firestore", "Templates"];

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "10px 20px",
      borderBottom: "1px solid #ccc",
      backgroundColor: "#f8f8f8",
      width: "600px",
      height: "60px",
      borderRadius: "30px",
      marginTop: "10px"
    }}>
      {navItems.map(item => (
        <button
          key={item}
          onClick={() => setCurrentView(item)}
          style={{
            padding: "10px 15px",
            border: "none",
            borderBottom: currentView === item ? "2px solid #007bff" : "none",
            background: "transparent",
            cursor: "pointer",
            fontWeight: currentView === item ? "bold" : "normal"
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
