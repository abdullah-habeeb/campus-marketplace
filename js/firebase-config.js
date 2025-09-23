// js/firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// Your web app's Firebase configuration (PASTE YOURS HERE)
const firebaseConfig = {
  apiKey: "AIzaSyCNOOPv3hcg23owWKGFWDtuJhtxVLUo_VA",
  authDomain: "campus-marketplace-f720a.firebaseapp.com",
  projectId: "campus-marketplace-f720a",
  storageBucket: "campus-marketplace-f720a.firebasestorage.app",
  messagingSenderId: "790341321796",
  appId: "1:790341321796:web:af7a6ae3b7a5e410baa811"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// EXPORT the services so other files can import and use them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // New service for file uploads