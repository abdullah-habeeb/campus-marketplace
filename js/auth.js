// js/auth.js - FINAL CORRECTED VERSION

import { auth, db } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Get HTML Elements ---
const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const googleSigninBtn = document.getElementById('google-signin-btn');
const collegeSelect = document.getElementById('college-select');
const errorMessage = document.getElementById('error-message');

// --- THE GATEKEEPER: Checks login status and profile completeness ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists() && userDoc.data().collegeId) {
        // If profile is complete, go to the main app
        window.location.href = 'index.html';
    } else {
        // If profile is incomplete, go to the profile completion page
        window.location.href = 'complete-profile.html';
    }
  }
  // If no user, do nothing and stay on the login page.
});

// --- Function to populate the college dropdown menu ---
async function populateColleges() {
    try {
        const collegesSnapshot = await getDocs(collection(db, "colleges"));
        collegeSelect.innerHTML = '<option value="">Select your college</option>';
        collegesSnapshot.forEach((doc) => {
            const college = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${college.name}, ${college.city}`;
            collegeSelect.appendChild(option);
        });
    } catch (error) { 
        console.error("Error fetching colleges:", error);
        errorMessage.textContent = "Could not load college list.";
    }
}

// --- Event Listener for Email/Password SIGN UP ---
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const collegeId = collegeSelect.value;
    if (!collegeId) { 
        errorMessage.textContent = "Please select your college.";
        return; 
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid, name: name, email: user.email, collegeId: collegeId, createdAt: new Date()
        });
        // onAuthStateChanged will handle the redirect automatically
    } catch (error) { 
        errorMessage.textContent = error.message; 
    }
});

// --- Event Listener for Email/Password LOGIN ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the redirect automatically
    } catch (error) { 
        errorMessage.textContent = error.message; 
    }
});

// --- Event Listener for GOOGLE SIGN-IN ---
googleSigninBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle the redirect automatically
    } catch (error) { 
        errorMessage.textContent = error.message; 
    }
});

// --- Run this function when the page loads ---
populateColleges();