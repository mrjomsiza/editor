import React, { useState } from "react";
import { doc, getDoc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig.js"; // your firestore config
import { getAuth } from "firebase/auth";
import WebMessages from "./WebMessages.jsx";
import Assets from "./Assets.jsx";



export default function AllSites({ websites =[] }) {
  const [newWebsiteName, setNewWebsiteName] = useState("");
  const [selectedSite, setSelectedSite] = useState(null);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const [messagesPopUp, setMessagesPopUp] = useState(false);
  const [assestsPopUp, setAssetsPopUp] = useState(false);


  // ✅ 1️⃣ Safe access to settings
  const settings = selectedSite?.websiteSettings;

  // let username = null;
  // let workspaceName = null;
  // let websiteName = null;

  // getDoc(doc(db, "users", userId)).then((snap) => {
  //   if (snap.exists()) username = snap.data().username;
  // });

  // getDoc(doc(db, "workspaces", userId)).then((snap) => {
  //   if (snap.exists()) workspaceName = snap.data().workspaceName;
  // });

  // if (selectedSite) {
  //   getDoc(doc(db, "workspaces", userId, "websites", selectedSite.id))
  //     .then((snap) => {
  //       if (snap.exists()) websiteName = snap.data().name;
  //     });
  // }


  // ✅ 2️⃣ Decide which domain to show
  const rawDomain =
    settings?.customDomain && settings.customDomain.trim() !== ""
      ? settings.customDomain
      : settings?.previewDomain || "";

  // ✅ 3️⃣ Make it a valid clickable URL
  const displayUrl = rawDomain.startsWith("http")
    ? rawDomain
    : `https://${rawDomain}`;

  if (!userId) {
    return <p>User not logged in</p>;
  }


  const handleAddClick = async () => {
    if (!newWebsiteName.trim()) return;
  
    try {
      const workspaceId = userId; 
      // You can later change to allow multiple workspaces per user
  
      // 1️⃣ Reference the Websites subcollection
      const websiteRef = doc(collection(db, "workspaces", workspaceId, "websites"));
  
      // 2️⃣ Create Website Document
      await setDoc(websiteRef, {
        websiteId: websiteRef.id,
        name: newWebsiteName,
        createdAt: serverTimestamp(),
      });
  
      // ---------------------------------------------
      // 3️⃣ Create Website Settings Subcollection Doc
      // ---------------------------------------------
      await setDoc(
        doc(websiteRef, "websiteSettings", "general"),
        {
          websiteId: websiteRef.id,
          workspaceId: workspaceId,
          siteName: newWebsiteName,
          customDomain: "",
          previewDomain: `${newWebsiteName.toLowerCase().replace(/\s+/g, "")}.bakayisedevelopers.co.za`,
          favicon: "",
          published: false,
          createdAt: serverTimestamp(),
        }
      );
  
      // ---------------------------------------------
      // 4️⃣ Create Pages Subcollection + Home Page Doc
      // ---------------------------------------------
      const homePageRef = doc(websiteRef, "pages", "home");
  
      await setDoc(homePageRef, {
        pageId: "home",
        pageName: "Home",
        createdAt: new Date(),
        // page settings map
        settings: {
          title: "Home",
          description: "Welcome to our website",
          seoEnabled: true
        },
        // page tree map (initial empty layout)
        tree: {
          id: "root",
          type: "page",
          children: []
        }
      });
  
      // ---------------------------------------------
      // 5️⃣ Prepare Messages Subcollection (No doc yet)
      // ---------------------------------------------
      // We don't need to create a doc yet.
      // Messages will be added later like this:
      // collection(websiteRef, "messages")
  
      alert("Website created successfully!");
      setNewWebsiteName("");
  
    } catch (error) {
      console.error("Error creating site:", error);
      alert("Failed to create site.");
    }
  };

  return (
  <>
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
      {/* ================= LEFT PANEL ================= */}
      {selectedSite && (
        <div
        style={{
          width: "350px",
          backgroundColor: "white",
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid rgb(255, 255, 255)",
          color: "white",
          flexDirection: "column",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          gap: "15px"
        }}
      >
        <h2 style={{ 
          color: "black",
          marginBottom: "15px"
        }}>
          Site Details
        </h2>

        <a
          href={displayUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "black",
            marginTop: "20px",
            textDecoration: "none"
          }}
        >
          {rawDomain || "No domain yet"}
        </a>

        <p style={{ 
          color: "black",
          marginTop: "15px"
        }}>
          <strong>Name:</strong> {selectedSite.name}
        </p>
           
        <button
            style={{
              backgroundColor: "black",   // blue
              display: "inline-block",
              padding: "10px",
              color: "#ffffff",
              borderRadius: "18px",
              textAlign: "center",
              border: "none",
              cursor: "pointer",
              marginTop: "15px"
            }}
            >
                Advanced Settings
        </button>
         
      </div>
      )}
      

      {/* ================= MIDDLE PANEL ================= */}
      <div
        style={{
          width: "60%",
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "16px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderBlockStyle: "solid",
          borderBlockWidth: "1px",
        }}
      >
        {/* Header + Add Site */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "14px"
          }}
        >
          <h2 style={{ 
            margin: "0",
            color: "black" 

          }}>All Sites</h2>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="New site name"
              value={newWebsiteName}
              onChange={(e) => setNewWebsiteName(e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "8px",
                border: "1px solid #475569",
                backgroundColor: "#020617",
                color: "white"
              }}
            />

            <button
              onClick={handleAddClick}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Sites Grid */}
        <div
          style={{
            flex: 1,
            overflowY: "auto"
          }}
        >
          <div
            style={{
              display: "grid",
              alignContent: "center",
              justifyContent: "center",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px"
            }}
          >
            {websites.length === 0 && (
              <div
                style={{
                  padding: "20px",
                  textAlign: "center",
                  color: "#94a3b8",
                  border: "1px dashed #334155",
                  borderRadius: "10px"
                }}
              >
                No sites yet
              </div>
            )}

            {websites.map((site) => (
              <div
                key={site.id}
                onClick={() => setSelectedSite(site)}
                style={{
                  backgroundColor:
                    selectedSite?.id === site.id ? "#1e293b" : "#111827",
                  border:
                    selectedSite?.id === site.id
                      ? "2px solid #2563eb"
                      : "1px solid #334155",
                  borderRadius: "12px",
                  padding: "8px",
                  cursor: "pointer",
                  transition: ".2s"
                }}
              >
                <div
                  style={{
                    backgroundColor: "#020617",
                    padding: "12px",
                    height: "150px",
                    width: "100%",
                    borderRadius: "10px",
                    border: "1px solid #334155",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "#94a3b8",
                    marginBottom: "8px"
                    }}
                >
                  (Website preview will go here)
                </div>

                <h3 style={{ margin: "0", fontSize: "14px" }}>{site.name}</h3>

                <a
                  href={displayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "white",
                    marginTop: "15px",
                    marginBottom: "15px",
                    textDecoration: "none",
                    fontSize: "10px",
                  }}
                >
                  {rawDomain || "No domain yet"}
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      {selectedSite && (
        <div
        style={{
          width: "350px",
          backgroundColor: "white",
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: "16px",
          padding: "16px",
          border: "1px solid rgb(255, 255, 255)",
          color: "white",
        }}
      >
        <h2 style={{ marginTop: 0, color: "black" }}>Website Viewer</h2>

            <ul style={{ marginTop: "16px", gap: "30px"}}>
              <div
              onClick={() => setMessagesPopUp(true)}
              style={
                {
                  textAlign: "center",
                  padding: "0rem 0.5rem 0rem 0.5rem",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "0px 18px 18px 0px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  height: "50px",
                  marginTop: "15px",
                  cursor: "pointer"
              }}>
                <p style={{
                  color: "black",
                }}>
                  Messages
                </p>

                <p style={{
                  color: "black"
                }}>
                  ▶
                </p>

              </div>

              <div style={
                {
                  textAlign: "center",
                  padding: "0rem 0.5rem 0rem 0.5rem",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "0px 18px 18px 0px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  height: "50px",
                  marginTop: "15px",
                  cursor: "pointer"
              }}>
                <p style={{
                  color: "black",
                }}>
                  Analytics
                </p>

                <p style={{
                  color: "black"
                }}>
                  ▶
                </p>

              </div>

              <div 
              onClick={() => setAssetsPopUp(true)}
              style={{
                  textAlign: "center",
                  padding: "0rem 0.5rem 0rem 0.5rem",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "0px 18px 18px 0px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  height: "50px",
                  marginTop: "15px",
                  cursor: "pointer"
              }}>
                <p style={{
                  color: "black",
                }}>
                  Assets
                </p>

                <p style={{
                  color: "black"
                }}>
                  ▶
                </p>

              </div>

              <div
              style={
                {
                  textAlign: "center",
                  padding: "0rem 0.5rem 0rem 0.5rem",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "0px 18px 18px 0px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  height: "50px",
                  marginTop: "15px",
                  cursor: "pointer"
              }}>
                <p style={{
                  color: "black",
                }}>
                  Edit
                </p>

                <p style={{
                  color: "black"
                }}>
                  ▶
                </p>

              </div>

            </ul>
      </div>
      )}
      
    </div>

    {messagesPopUp === true && (
      <div
        style={{
          backgroundColor: "trasnparent",
          backdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.3)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "1000",
          position: "absolute",
          width: "100%",
          height: "100%",
          top: "0px",
          left: "0px"
        }}
      >
        <div  // container
          style={{
            borderRadius: "20px",
            padding: "15px",
            width: "60%",
            height: "80%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignContent: "center"
          }}>
            <div // row component
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                margin: "20px"
              }}
            >
              <h1
                onClick={()=>setMessagesPopUp(false)}
                style={{
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ❌
              </h1>
              
            </div>

            <div
              style={{
                margin: "20px"
              }}
            >
              <WebMessages 
                websiteId={selectedSite.id} 
                workspaceId={userId}/>
            </div>
        </div>
      </div>
    )}

    {assestsPopUp === true && (
      <div
        style={{
          backgroundColor: "trasnparent",
          backdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.3)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          zIndex: "1000",
          position: "absolute",
          width: "100%",
          height: "100%",
          top: "0px",
          left: "0px"
        }}
      >
        <div  // container
          style={{
            borderRadius: "20px",
            padding: "15px",
            width: "60%",
            height: "80%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignContent: "center"
          }}>
            <div // row component
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "flex-end",
                margin: "20px"
              }}
            >
              <h1
                onClick={()=>setAssetsPopUp(false)}
                style={{
                  color: "black",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ❌
              </h1>
              
            </div>

            <div
              style={{
                margin: "20px"
              }}
            >
              <Assets 
                workspaceId={userId}
                websiteId={selectedSite.id}
              />
            </div>
        </div>
      </div>
    )}
  </>
  );
}
