// js/auth.js

import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Get HTML Elements ---
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const googleSigninBtn = document.getElementById('google-signin-btn');
const collegeSelect = document.getElementById('college-select');

// --- THE GATEKEEPER ---
onAuthStateChanged(auth, (user) => {
  if (user) {
    // If a user is logged in, redirect them to the main marketplace
    window.location.href = 'index.html';
  }
});


// --- Signup Form Logic ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const collegeId = collegeSelect.value;

    if (!collegeId) {
        alert("Please select your college.");
        return;
    }

    try {
        // Step 1: Create the user account in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Create a corresponding user profile document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            name: name,
            email: user.email,
            collegeId: collegeId,
            createdAt: new Date()
        });
        
    } catch (error) {
        console.error("Error during signup:", error);
        alert(error.message);
    }
});

// --- Login Form Logic ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the redirect
    } catch (error) {
        console.error("Error during login:", error);
        alert(error.message);
    }
});


// --- Google Sign-In Logic ---
googleSigninBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // After a Google sign-in, we need to check if a profile exists.
        // If not, we should create one. This is crucial for new users.
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            // This is a new user, create their profile document
            await setDoc(userDocRef, {
                uid: user.uid,
                name: user.displayName, // Comes directly from Google
                email: user.email,
                collegeId: null, // User needs to select this after signup
                createdAt: new Date()
            });
            console.log("New Google user profile created.");
        }
        // onAuthStateChanged will handle the redirect
    } catch (error) {
        console.error("Google Sign-In Error:", error);
        alert(error.message);
    }
});