import React, { useState, useEffect } from "react";
import TopNav from "../components/TopNav";
import AllSites from "../components/AllSites";
import Account from "../components/Account";
import Documents from "../components/Documents";
import Support from "../components/Support";
import { auth, db } from "../firebaseConfig";
import { createWorkspaceIfNotExist, getUserSites, addSiteToUser } from "../firebaseHelpers";
import { onSnapshot, collection } from "firebase/firestore";

export default function Workspace() {
  const [currentView, setCurrentView] = useState("Websites");
  const [userData, setUserData] = useState(null);
  const [websites, setWebsites] = useState([]);

  // ===============================
  // 🚫 Mobile / Tablet Blocking
  // ===============================
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // If width is less than 1024px consider it mobile / tablet
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initWorkspace = async () => {
      if (auth.currentUser) {
        await createWorkspaceIfNotExist(auth.currentUser);

        setUserData({
          uid: auth.currentUser.uid,
          username: auth.currentUser.displayName || "User",
          email: auth.currentUser.email
        });

        const workspaceId = auth.currentUser.uid;

        const unsubscribe = onSnapshot(
          collection(db, "workspaces", workspaceId, "websites"),
          (snapshot) => {
            const siteData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setWebsites(siteData);
          }
        );

        return () => unsubscribe();
      }
    };

    initWorkspace();
  }, []);

  const handleAddSite = async (websiteName) => {
    if (!websiteName) return;
    const newWebsite = await addSiteToUser(auth.currentUser.uid, websiteName);
    setWebsites(prev => [newWebsite, ...prev]);
  };

  // ===============================
  // 📱 Show Mobile Block Screen
  // ===============================
  if (isMobile) {
    return (
      <div style={{
        background: "#000",
        color: "white",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "20px"
      }}>
        <div>
          <h2 style={{ marginBottom: "10px" }}>
            🚫 Desktop Only
          </h2>
          <p style={{ fontSize: "16px", opacity: 0.9 }}>
            Apologies, but this workspace is only available on a Desktop or Laptop.
            <br/>
            Please switch to a larger screen to continue.
          </p>
        </div>
      </div>
    );
  }

  // ===============================
  // 💻 NORMAL DESKTOP VIEW
  // ===============================
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      justifyContent: "flex-start",
      alignItems: "center",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "white",
      height: "100vh",
      width: "100%",
      paddingTop: "20px",
      paddingRight: "50px",
      paddingLeft: "50px",
      paddingBottom: "20px",
      gap: "20px"
    }}>

      <TopNav currentView={currentView} setCurrentView={setCurrentView} />

      <div style={{ 
        padding: "20px", 
        width: "100vw",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "white"
      }}>
        {currentView === "Websites" && (
          <AllSites websites={websites} onAddSite={handleAddSite} />
        )}
        {currentView === "Account" && <Account user={{ ...userData, websites }} />}
        {currentView === "Documents" && <Documents />}
        {currentView === "Templates" && <Support />}
      </div>
    </div>
  );
}
