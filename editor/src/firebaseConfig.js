import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyBPHXPNOA2OI1ni4K7dZJUrU_6ePocUi0E",
    authDomain: "bakayise-website-builder.firebaseapp.com",
    projectId: "bakayise-website-builder",
    storageBucket: "bakayise-website-builder.firebasestorage.app",
    messagingSenderId: "452498662302",
    appId: "1:452498662302:web:f550c18b515d87eebfac8f",
    measurementId: "G-XQXBLKQWTY"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
