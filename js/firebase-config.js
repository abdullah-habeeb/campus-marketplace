// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCNOOPv3hcg23owWKGFWDtuJhtxVLUo_VA",
  authDomain: "campus-marketplace-f720a.firebaseapp.com",
  projectId: "campus-marketplace-f720a",
  storageBucket: "campus-marketplace-f720a.firebasestorage.app",
  messagingSenderId: "790341321796",
  appId: "1:790341321796:web:af7a6ae3b7a5e410baa811"
  // PASTE YOUR FIREBASE CONFIG OBJECT HERE
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);


