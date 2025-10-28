// js/auth.js
import { auth, db } from './firebase-config.js'; // This is the crucial import
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup, 
    GoogleAuthProvider, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, setDoc, getDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');
const googleSigninBtn = document.getElementById('google-signin-btn');
const collegeSelect = document.getElementById('college-select');
const errorMessage = document.getElementById('error-message');

// js/auth.js
// js/auth.js
onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Auth State: User logged in. Checking profile...");
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
  
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Profile data found:", userData);
          // Check specifically if collegeId exists AND is not empty/null
          if (userData.collegeId) { 
              console.log("Profile complete (collegeId found). Redirecting to index...");
              window.location.href = 'index.html';
          } else {
              console.log("Profile incomplete (collegeId missing or empty). Redirecting to complete-profile...");
              window.location.href = 'complete-profile.html';
          }
        } else {
          console.log("Profile document does not exist. Redirecting to complete-profile...");
          window.location.href = 'complete-profile.html';
        }
      } catch (error) {
          console.error("Error checking user profile:", error);
          // Decide where to send user if profile check fails, maybe login?
          window.location.href = 'login.html'; 
      }
    } else {
        console.log("Auth State: No user logged in.");
        // Stay on login page or handle appropriately
    }
  });

  async function populateColleges() {
    console.log("Attempting to populate colleges..."); // Add this log
    try {
        const collegesSnapshot = await getDocs(collection(db, "colleges"));
        if (collegesSnapshot.empty) { // Check if the collection is empty
            console.warn("No colleges found in the database!");
            collegeSelect.innerHTML = '<option value="">No colleges available</option>';
            return;
        }
        collegeSelect.innerHTML = '<option value="">Select your college</option>';
        collegesSnapshot.forEach((doc) => {
            const college = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = `${college.name}, ${college.city}`;
            collegeSelect.appendChild(option);
        });
        console.log("Colleges populated successfully."); // Add this log
    } catch (error) {
        console.error("Error fetching colleges:", error); // Check for errors here
        errorMessage.textContent = "Could not load college list.";
    }
}

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
    } catch (error) { 
        errorMessage.textContent = error.message; 
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) { 
        errorMessage.textContent = error.message; 
    }
});

googleSigninBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid, name: user.displayName, email: user.email,
                collegeId: null, createdAt: new Date()
            });
        }
    } catch (error) { 
        errorMessage.textContent = error.message; 
    }
});

populateColleges();