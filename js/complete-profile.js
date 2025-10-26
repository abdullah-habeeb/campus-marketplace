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
        //window.location.href = 'login.html';
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

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) { alert("Error: You are not logged in."); return; }

    const collegeId = collegeSelect.value;
    const name = nameInput.value;
    const dob = document.getElementById('profile-dob').value;
    const phone = document.getElementById('profile-phone').value;
    if (!collegeId || !name || !dob || !phone) { alert("Please fill out all fields."); return; }

    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        let profileData = {
            uid: currentUser.uid,
            email: currentUser.email,
            name: name, dob: dob, phone: phone, collegeId: collegeId,
        };

        if (!userDoc.exists()) {
            profileData.createdAt = new Date();
        }

        await setDoc(userDocRef, profileData, { merge: true });
        window.location.href = 'index.html';

    } catch (error) {
        console.error("Error creating/updating profile:", error);
        alert(error.message);
    }
});