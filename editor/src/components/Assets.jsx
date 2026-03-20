// ✅ React core imports
// useState  -> stores dynamic values (folders, input, uploads, etc.)
// useEffect -> runs code automatically when component loads or when dependencies change
import React, { useState, useEffect } from "react";


// ==========================
//  FIRESTORE IMPORTS
// ==========================
import { db } from "../firebaseConfig";
import {
  collection,   // points to a collection path
  addDoc,       // creates a document
  deleteDoc,    // deletes a document
  getDocs,      // reads docs
  doc           // points to a specific document
} from "firebase/firestore";


// ==========================
//  STORAGE IMPORTS
// ==========================
import { storage } from "../firebaseConfig";
import {
  ref,            // reference to a storage path
  uploadBytes,    // upload file
  listAll,        // list items in folder
  getDownloadURL, // get public image url
  deleteObject    // delete file
} from "firebase/storage";


// ===================================================
//  MAIN COMPONENT
// ===================================================
const Assets = ({ workspaceId, websiteId }) => {

  // Stores all folder documents from Firestore
  const [folders, setFolders] = useState([]);

  // Stores user input while typing folder name
  const [newFolderName, setNewFolderName] = useState("");

  // Tracks which folder is currently expanded (showing images)
  const [expandedFolder, setExpandedFolder] = useState(null);

  // Stores loaded images for each folder
  // Structure: { folderId: [images...] }
  const [folderImages, setFolderImages] = useState({});

  // Shows loading state while uploading
  const [uploadingFolder, setUploadingFolder] = useState("");


  // ===================================================
  //  🔥 ADDED: STORAGE USAGE STATE
  //  Will hold total bytes used by all folders
  // ===================================================
  const [storageUsed, setStorageUsed] = useState(0);


  // ===================================================
  //  FIRESTORE COLLECTION PATH
  //  workspaces / workspaceId / websites / websiteId / assets
  // ===================================================
  const assetsCollectionRef = collection(
    db,
    "workspaces",
    workspaceId,
    "websites",
    websiteId,
    "assets"
  );


  // ===================================================
  //  LOAD FOLDERS FROM FIRESTORE ON COMPONENT LOAD
  // ===================================================
  useEffect(() => {
    // Define an asynchronous function to load all folders for the current website
    const loadFolders = async () => {
  
      // 🔹 Create a reference to the Firestore collection for assets
      // Path: workspaces/{workspaceId}/websites/{websiteId}/assets
      const assetsCollectionRef = collection(
        db,            // Firestore database reference
        "workspaces",  // Top-level collection
        workspaceId,   // Workspace document ID (from props)
        "websites",    // Subcollection for websites
        websiteId,     // Website document ID (from props)
        "assets"       // Collection containing folder documents
      );
  
      // 🔹 Fetch all documents in the assets collection
      const snapshot = await getDocs(assetsCollectionRef);
  
      // 🔹 Map the documents to an array of objects with `id` and document data
      const foldersArray = snapshot.docs.map(d => ({
        id: d.id,       // Firestore document ID
        ...d.data()     // All data fields from the document
      }));
  
      // 🔹 Store the fetched folders in the component state
      setFolders(foldersArray);
    };
  
    loadFolders();
  
  }, [workspaceId, websiteId]); // no ESLint warning  



  // ===================================================
  //  🔥 ADDED: FORMAT BYTES (convert bytes → MB/GB)
  // ===================================================
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 MB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };


  // ===================================================
  //  🔥 ADDED: CALCULATE TOTAL STORAGE USED
  //  Loops through all folders and sums all file sizes
  // ===================================================
  useEffect(() => {
    const calculateStorage = async () => {
      try {
        let totalBytes = 0;

        // Loop through folders
        for (const folder of folders) {
          const folderRef = ref(storage, folder.storagePath);

          // List all files inside the folder
          const items = await listAll(folderRef);

          // Loop through each file and read metadata
          for (const itemRef of items.items) {

            // Skip placeholder file
            if (itemRef.name === ".placeholder") continue;

            // Fetch metadata to get file size
            const metadata = await itemRef.getMetadata();

            // Add size to total
            totalBytes += metadata.size;
          }
        }

        // Save total bytes to state
        setStorageUsed(totalBytes);

      } catch (err) {
        console.error("Error calculating storage:", err);
      }
    };

    if (folders.length > 0) calculateStorage();
  }, [folders]); 
  // 🔥 Recalculates storage whenever folders or file changes occur



  // ===================================================
  //  CREATE FOLDER (🔥 Storage + Firestore)
  // ===================================================
  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    const storagePath =
      `workspaces/${workspaceId}/websites/${websiteId}/assets/${newFolderName}/`;

    await addDoc(assetsCollectionRef, {
      name: newFolderName,
      storagePath,
      createdAt: new Date()
    });

    const placeholderRef = ref(storage, storagePath + ".placeholder");
    await uploadBytes(placeholderRef, new Blob(["placeholder"]));

    setNewFolderName("");

    const snapshot = await getDocs(assetsCollectionRef);
    setFolders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };



  // ===================================================
  //  DELETE FOLDER (Firestore only)
  // ===================================================
  const deleteFolder = async (folderId) => {
    if (!window.confirm("Delete this folder reference? Images remain in storage.")) return;

    await deleteDoc(
      doc(
        db,
        "workspaces",
        workspaceId,
        "websites",
        websiteId,
        "assets",
        folderId
      )
    );

    setFolders(folders.filter(f => f.id !== folderId));
  };



  // ===================================================
  //  LOAD IMAGES INSIDE STORAGE FOLDER
  // ===================================================
  const loadFolderImages = async (folder) => {
    const folderRef = ref(storage, folder.storagePath);
    const items = await listAll(folderRef);

    const urls = await Promise.all(
      items.items.map(async item => ({
        name: item.name,
        url: await getDownloadURL(item),
        ref: item
      }))
    );

    setFolderImages(prev => ({
      ...prev,
      [folder.id]: urls.filter(i => i.name !== ".placeholder")
    }));
  };



  // ===================================================
  //  TOGGLE FOLDER
  // ===================================================
  const toggleFolder = async (folder) => {
    if (expandedFolder === folder.id) {
      setExpandedFolder(null);
    } else {
      setExpandedFolder(folder.id);
      await loadFolderImages(folder);
    }
  };



  // ===================================================
  //  UPLOAD FILES
  // ===================================================
  const uploadToFolder = async (folder, e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingFolder(folder.id);

    for (const file of files) {
      const fileRef = ref(storage, folder.storagePath + file.name);
      await uploadBytes(fileRef, file);
    }

    await loadFolderImages(folder);
    setUploadingFolder("");
  };



  // ===================================================
  //  DELETE IMAGE
  // ===================================================
  const deleteImage = async (folder, imageRef) => {
    if (!window.confirm("Delete this image?")) return;

    await deleteObject(imageRef);
    await loadFolderImages(folder);
  };



  // ===================================================
  //  USER INTERFACE
  // ===================================================
  return (
    <div style={{
      background: "white",
      padding: "1.5rem",
      borderRadius: "16px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      marginTop: "20px"
    }}>
      <h2 style={{ marginBottom: 5 }}>Website Asset Folders</h2>

      {/* =================================================
          🔥 ADDED: STORAGE USAGE DISPLAY
          Shows: “50MB of 2GB (2.5% used)”
      ================================================== */}
      <div style={{ marginBottom: 15, fontWeight: "bold", color: "#444" }}>
        {formatBytes(storageUsed)} of 2048 MB (
          {((storageUsed / (2 * 1024 * 1024 * 1024)) * 100).toFixed(2)}% used
        )
      </div>


      {/* CREATE FOLDER INPUT */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <input
          value={newFolderName}
          placeholder="Enter folder name"
          onChange={(e) => setNewFolderName(e.target.value)}
          style={{
            padding: 8,
            flex: 1,
            borderRadius: 8,
            border: "1px solid #ccc"
          }}
        />

        <button
          onClick={createFolder}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer"
          }}
        >
          ➕ Create
        </button>
      </div>


      {/* FOLDER LIST */}
      {folders.length === 0 ? (
        <p style={{ color: "#666" }}>No folders yet...</p>
      ) : (
        folders.map(folder => (
          <div key={folder.id} style={{
            background: "#f7f7f7",
            padding: 12,
            borderRadius: 10,
            marginBottom: 12
          }}>

            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <strong>{folder.name}</strong>

              <div style={{ display: "flex", gap: 8 }}>

                <label style={{
                  background: "black",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer"
                }}>
                  {uploadingFolder === folder.id ? "Uploading..." : "Upload Images"}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    hidden
                    onChange={(e) => uploadToFolder(folder, e)}
                  />
                </label>

                <button
                  onClick={() => toggleFolder(folder)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "2px solid black",
                    background: "transparent",
                    cursor: "pointer"
                  }}
                >
                  {expandedFolder === folder.id ? "Hide" : "Show"}
                </button>

                <button
                  onClick={() => deleteFolder(folder.id)}
                  style={{
                    background: "#dc2626",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: 8,
                    cursor: "pointer"
                  }}
                >
                  🗑
                </button>
              </div>
            </div>


            {expandedFolder === folder.id && (
              <div style={{
                marginTop: 12,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 10
              }}>

                {(folderImages[folder.id] || []).map(img => (
                  <div
                    key={img.name}
                    style={{
                      position: "relative",
                      aspectRatio: "1/1",
                      overflow: "hidden",
                      borderRadius: 10,
                      background: "#ddd"
                    }}
                  >
                    <img
                      src={img.url}
                      alt=""
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />

                    <button
                      onClick={() => deleteImage(folder, img.ref)}
                      style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        background: "rgba(0,0,0,0.75)",
                        color: "white",
                        border: "none",
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        cursor: "pointer"
                      }}
                    >
                      🗑
                    </button>
                  </div>
                ))}

              </div>
            )}

          </div>
        ))
      )}
    </div>
  );
};

export default Assets;
