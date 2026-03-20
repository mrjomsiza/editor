import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const WebMessages = ({ workspaceId, websiteId }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!workspaceId || !websiteId) return;

      const q = query(
        collection(db, `workspaces/${workspaceId}/websites/${websiteId}/messages`),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(data);
    };

    fetchMessages();
  }, [workspaceId, websiteId]);

  const openWhatsApp = (number, name) => {
    const text = encodeURIComponent(
      `Hi ${name}, thank you for contacting us.`
    );
    window.open(`https://wa.me/${number}?text=${text}`, "_blank");
  };

  return (
    <div
      style={{
        background: "white",
        padding: "1.5rem",
        borderRadius: "16px",
        marginBottom: "2rem",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <h2>Website Messages</h2>

      {messages.map(msg => (
        <div
          key={msg.id}
          style={{
            display: "flex",
            gap: "20px",
            padding: "1rem 0",
            borderBottom: "1px solid #eee",
            flexWrap: "wrap",
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ width: "30%", minWidth: "160px" }}>
            <p style={{ margin: "4px 0" }}>
              <strong>{msg.name}</strong>
            </p>

            <p style={{ color: "#666", fontSize: "0.9rem", margin: "4px 0" }}>
              {msg.whatsappNumber}
            </p>

            <button
              onClick={() => openWhatsApp(msg.whatsappNumber, msg.name)}
              style={{
                marginTop: "10px",
                background: "#25d366",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
              onMouseOver={e => (e.target.style.background = "#1ebe5d")}
              onMouseOut={e => (e.target.style.background = "#25d366")}
            >
              💬 WhatsApp
            </button>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              width: "fit-content",
              background: "#f7f7f7",
              padding: "12px",
              borderRadius: "10px",
              flex: 1,
              minWidth: "200px",
            }}
          >
            <p style={{ margin: 0 }}>{msg.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WebMessages;
