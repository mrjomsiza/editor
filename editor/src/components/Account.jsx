import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export default function Account({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null); // Default panel
  const [profile, setProfile] = useState({
    username: user?.displayName || "",
    phone: "",
    bio: user?.bio || "",
  });

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return;
  
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        setProfile(prev => ({ ...prev, ...snap.data() }));
      } 
    };
  
    if (activeTab === "profile") loadProfile();
  }, [activeTab, user]);
  
  
  const saveProfile = async () => {
    try {
      if (!user?.uid) {
        alert("User missing");
        return;
      }
  
      console.log("Saving profile...", profile);
  
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
  
      if (snap.exists()) {
        await updateDoc(ref, profile);
      } else {
        await setDoc(ref, {
          ...profile,
          createdAt: Date.now()
        });
      }
  
      alert("Profile saved successfully 👍");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed: " + err.message);
    }
  };
  
  

  if (!user)
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        Loading user data...
      </div>
    );

  // Logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Right Panel Content Renderer
  const renderContent = () => {
    
    switch (activeTab) {
      case "profile":
        return (
          <div
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
              alignContent: "flex-start",
              gap: "50px"
            }}
          >
            <div
              style={{
                borderRadius: "10px",
                margin: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                marginBottom: "15px"
              }}
            >
              <h2
                style={{
                  color: "black",
                  marginBottom: "15px"
                }}
              >Profile</h2>

              <p
                style={{
                  color: "black",
                  marginBottom: "15px"
                }}>Manage personal information.</p>
            </div>

            <h2 style={{ color: "black", marginBottom: "15px"}}>Edit Profile</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
              
              <input
                type="text"
                placeholder="Username"
                value={profile.username}
                onChange={(e) =>
                  setProfile({ ...profile, username: e.target.value })
                }
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #1e293b",
                  color: "black"
                }}
              />

              <input
                type="text"
                placeholder="Phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #1e293b",
                  color: "black"
                }}
              />

              <input
                type="text"
                placeholder="Bio"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
                style={{
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid #1e293b",
                  color: "black"
                }}
              />


              <button
                onClick={saveProfile}
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Save Profile
              </button>
            </div>
          </div>
        );

      case "billing":
        return (
          <div>
            <h2
              style={{
                color: "black"
            }}>Billing</h2>
            
            <p
              style={{
                color: "black"
            }}>View invoices, subscription & payment methods.</p>
          </div>
        );
      case "settings":
        return (
          <div>
            <h2
              style={{
                color: "black"
            }}>Account Settings</h2>

            <p
              style={{
                color: "black"
            }}>Manage account preferences.</p>
          </div>
        );
      case "security":
        return (
          <div>
            <h2
              style={{
                color: "black"
            }}>Security</h2>

            <p
              style={{
                color: "black"
            }}>Authentication & Security settings.</p>
          </div>
        );
      case "notifications":
        return (
          <div>
            <h2
              style={{
                color: "black"
            }}>Notifications</h2>
            
            <p
              style={{
                color: "black"
            }}>Control email & system notifications.</p>
          </div>
        );
      case "support":
        return (
          <div>
            <h2
              style={{
                color: "black"
            }}>Support</h2>
            
            <p
              style={{
                color: "black"
            }}>Contact support or view help resources.</p>
          </div>
        );
      default:
        return <h2
        style={{
          color: "black"
        }}>Select a section</h2>;
    }
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        gap: "20px",
        padding: "20px",
        boxSizing: "border-box",
        borderRadius: "24px"
      }}
    >

      {/* -------------------------------- LEFT PANEL -------------------------------- */}
      <div
        style={{
          width: "350px",
          backgroundColor: "white",
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid rgb(255, 255, 255)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        {/* USER INFO */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "20px",
                color: "black"
              }}
            >
              {user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <h3 style={{ margin: 0, color: "black" }}>{user?.username || "User"}</h3>
              <small style={{ color: "black" }}>{user?.email}</small>
            </div>
          </div>

          {/* Subscription Box */}
          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              backgroundColor: "#020617",
              borderRadius: "10px",
              border: "1px solid #1e293b"
            }}
          >
            <h4 style={{ margin: "0 0 6px 0" }}>Subscription</h4>
            <p style={{ margin: 0, color: "#a1a1aa" }}>
              Current Plan: <strong>Free</strong>
            </p>
            <button
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: "pointer"
              }}
            >
              Upgrade
            </button>
          </div>
        </div>

        {/* Logout Button Bottom */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "10px 0",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#ef4444",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>

      {/* -------------------------------- MIDDLE PANEL -------------------------------- */}
      <div
        style={{
          backgroundColor: "white",
          width: "60%",
          padding: "20px",
        }}
      >
        <h3 style={{
          marginBottom: "12px", 
          color: "black" 
          }}>
            Account Menu
        </h3>

        {[
          ["profile", "Profile"],
          ["billing", "Billing"],
          ["settings", "Account Settings"],
          ["security", "Security"],
          ["notifications", "Notifications"],
          ["support", "Support"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px",
              borderRadius: "8px",
              backgroundColor: activeTab === key ? "#1e293b" : "transparent",
              color: activeTab === key ? "white" : "black",
              border: "1px solid #1e293b",
              marginBottom: "8px",
              cursor: "pointer"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* -------------------------------- RIGHT PANEL -------------------------------- */}
      <div
        style={{
          width: "350px",
            backgroundColor: "white",
            borderRadius: "16px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
        }}
      >
        {activeTab && (
          <div style={{
            width: "350px",
            height: "100%",
            backgroundColor: "white",
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid rgb(255, 255, 255)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            {renderContent()}
          </div>
        )}
      </div>
    </div>
  );
}
