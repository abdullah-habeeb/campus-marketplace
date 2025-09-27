// js/post-item.js

import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// --- Get HTML Elements ---
const postItemForm = document.getElementById('post-item-form');
const uploadStatus = document.getElementById('upload-status');
let currentUser = null;
let userProfile = null;

// --- Gatekeeper ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Fetch the user's profile to get their name and collegeId
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            userProfile = userDoc.data();
        }
    } else {
        // If not logged in, redirect to login page
        window.location.href = 'login.html';
    }
});

// --- Form Submission Logic ---
postItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || !userProfile) {
        alert("You must be logged in to post an item.");
        return;
    }

    const title = document.getElementById('item-title').value;
    const description = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;
    const category = document.getElementById('item-category').value;
    const imageFile = document.getElementById('item-image').files[0];

    if (!imageFile) {
        alert("Please select an image to upload.");
        return;
    }

    uploadStatus.textContent = "Uploading image...";

    try {
        // Step 1: Upload the image to Firebase Storage
        const storageRef = ref(storage, `listings/${currentUser.uid}/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);

        // Step 2: Get the public URL of the uploaded image
        const imageUrl = await getDownloadURL(uploadResult.ref);
        uploadStatus.textContent = "Image uploaded! Saving listing...";

        // Step 3: Create the listing document in Firestore
        const newListing = {
            title: title,
            description: description,
            price: +price,
            category: category,
            imageUrl: imageUrl,
            sellerId: currentUser.uid,
            sellerName: userProfile.name,
            collegeId: userProfile.collegeId,
            postedAt: new Date(),
            isSold: false
        };

        await addDoc(collection(db, 'listings'), newListing);

        uploadStatus.textContent = "Listing posted successfully! Redirecting...";

        // Redirect to homepage after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);

    } catch (error) {
        console.error("Error posting item:", error);
        uploadStatus.textContent = `Error: ${error.message}`;
        alert("There was an error posting your item. Please try again.");
    }
});