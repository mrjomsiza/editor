import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";

// Ensure workspace exists for a user
export const createWorkspaceIfNotExist = async (user) => {
  const workspaceRef = doc(db, "workspaces", user.uid);
  const docSnap = await getDoc(workspaceRef);

  if (!docSnap.exists()) {
    await setDoc(workspaceRef, {
      userId: user.uid,
      username: user.displayName || "User",
      email: user.email
    });
  }
  return workspaceRef;
};

// Get all sites for a user
export const getUserSites = async (userId) => {
  const sitesCol = collection(db, "workspaces", userId, "sites");
  const q = query(sitesCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const sites = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return sites;
};

// Add a new site to a user workspace
export const addSiteToUser = async (userId, siteName) => {
  const sitesCol = collection(db, "workspaces", userId, "sites");
  const newSite = {
    name: siteName,
    createdAt: new Date().toISOString()
  };
  const docRef = await addDoc(sitesCol, newSite);
  return { id: docRef.id, ...newSite };
};

export const getMessages = async (userId, websiteId) => {
  const messagesCol = collection(db, "workspaces", userId, "websites", websiteId, "messages");
  const q = query(messagesCol, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return messages;
};
