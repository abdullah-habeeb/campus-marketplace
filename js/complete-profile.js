// js/complete-profile.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, setDoc, getDocs, collection, getDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const profileForm = document.getElementById('complete-profile-form');
const collegeSelect = document.getElementById('college-select');
const nameInput = document.getElementById('profile-name');
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if (user.displayName && nameInput) { nameInput.value = user.displayName; }
        populateColleges();
    } else {
        window.location.href = 'login.html';
    }
});

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
    } catch (error) { console.error("Error fetching colleges:", error); }
}

// js/complete-profile.js
profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) { /* ... handle error ... */ return; }

    const collegeId = collegeSelect.value;
    const name = nameInput.value;
    const dob = document.getElementById('profile-dob').value;
    const phone = document.getElementById('profile-phone').value;

    // More robust check for college selection
    if (!collegeId || collegeId === "") { 
        alert("Please select your college to continue.");
        return; 
    }
    if (!name || !dob || !phone) { /* ... handle error ... */ return; }

    try {
        const userDocRef = doc(db, "users", currentUser.uid);

        // Prepare the data, ensuring collegeId is included
        const profileData = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: name, dob: dob, phone: phone, 
            collegeId: collegeId, // Make sure this is being saved
            createdAt: new Date() // Always add createdAt for new profiles
        };

        console.log("Saving profile data:", profileData); // Log what's being saved

        // Use setDoc WITHOUT merge:true to ensure all fields are written for a new profile
        await setDoc(userDocRef, profileData); 

        console.log("Profile saved successfully. Redirecting to index...");
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Error saving profile:", error);
        alert(error.message);
    }
});