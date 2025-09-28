// js/post-item.js
import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { categories } from './categories.js'; // <-- NEW: Import categories

const postItemForm = document.getElementById('post-item-form');
const uploadStatus = document.getElementById('upload-status');
const categorySelect = document.getElementById('item-category'); // <-- NEW
let currentUser = null;
let userProfile = null;

// --- NEW: Function to populate the category dropdown ---
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
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            userProfile = userDoc.data();
        }
    } else {
        window.location.href = 'login.html';
    }
});

postItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    // ... (rest of the function is the same, just make sure 'category' is read from the select)
    const category = categorySelect.value;
    // ...
    if (!currentUser || !userProfile) { alert("You must be logged in..."); return; }
    const title = document.getElementById('item-title').value;
    const description = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;
    const imageFile = document.getElementById('item-image').files[0];
    if (!imageFile) { alert("Please select an image..."); return; }
    uploadStatus.textContent = "Uploading image...";
    try {
        const storageRef = ref(storage, `listings/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(uploadResult.ref);
        uploadStatus.textContent = "Image uploaded! Saving listing...";
        const newListing = {
            title, description, price: +price, category, imageUrl,
            sellerId: currentUser.uid, sellerName: userProfile.name,
            collegeId: userProfile.collegeId, postedAt: new Date(), isSold: false
        };
        await addDoc(collection(db, 'listings'), newListing);
        uploadStatus.textContent = "Listing posted successfully! Redirecting...";
        setTimeout(() => { window.location.href = 'index.html'; }, 2000);
    } catch (error) {
        console.error("Error posting item:", error);
        uploadStatus.textContent = `Error: ${error.message}`;
    }
});

// --- Run this when the page loads ---
populateCategories();