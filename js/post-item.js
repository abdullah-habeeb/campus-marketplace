// js/post-item.js
import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { categories } from './categories.js';

const postItemForm = document.getElementById('post-item-form');
const uploadStatus = document.getElementById('upload-status');
const categorySelect = document.getElementById('item-category');
let currentUser = null;
let userProfile = null;

function populateCategories() {
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            userProfile = userDoc.data();
        } else {
            // Handle case where user profile might not exist yet
            console.log("User profile not found, might need to complete it.");
            // Optionally redirect to complete-profile.html if needed
        }
    } else {
        window.location.href = 'login.html';
    }
});

postItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || !userProfile) { alert("User profile not loaded. Please wait or log in again."); return; }
    
    const title = document.getElementById('item-title').value;
    const description = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;
    const category = categorySelect.value;
    const imageFiles = document.getElementById('item-image').files;
    
    if (!category) { alert("Please select a category."); return; }
    if (imageFiles.length === 0 || imageFiles.length > 5) { alert("Please select 1 to 5 images."); return; }

    uploadStatus.textContent = `Uploading ${imageFiles.length} image(s)...`;
    // ... inside the submit listener ...
    try {
        console.log("Attempting to get storageRef..."); // DIAGNOSTIC
        const storageRef = ref(storage, `listings/${currentUser.uid}/${Date.now()}_${imageFiles[0].name}`); // Assuming single file for simplicity now
        console.log("storageRef obtained:", storageRef); // DIAGNOSTIC

        console.log("Attempting to call uploadBytes..."); // DIAGNOSTIC
        const uploadResult = await uploadBytes(storageRef, imageFiles[0]); // Try with just the first file
        console.log("uploadBytes SUCCEEDED:", uploadResult); // DIAGNOSTIC

        console.log("Attempting to get Download URL..."); // DIAGNOSTIC
        const imageUrl = await getDownloadURL(uploadResult.ref);
        console.log("Download URL obtained:", imageUrl); // DIAGNOSTIC

        // ... rest of the code to save to Firestore ...

    } catch (error) {
        console.error("--------------------------------------------------");
        console.error("CRITICAL ERROR DURING UPLOAD OR FIRESTORE SAVE:");
        console.error("Error Name:", error.name);
        console.error("Error Code:", error.code); // Firebase specific error code
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", error); // Log the entire error object
        console.error("--------------------------------------------------");
        uploadStatus.textContent = `Upload Failed: ${error.code || error.message}. Check console.`;
        alert("Upload failed. Please check the developer console for detailed errors.");
    }
// ... rest of the listener ...
});

populateCategories();