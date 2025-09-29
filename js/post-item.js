// js/post-item.js
import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

const postItemForm = document.getElementById('post-item-form');
const uploadStatus = document.getElementById('upload-status');
let currentUser = null;
let userProfile = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            userProfile = userDoc.data();
        }
    } else {
        window.location.href = 'login.html';
    }
});

postItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || !userProfile) { alert("You must be logged in..."); return; }

    const title = document.getElementById('item-title').value;
    const description = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;
    const category = document.getElementById('item-category').value;
    const imageFiles = document.getElementById('item-image').files;

    if (imageFiles.length === 0 || imageFiles.length > 5) {
        alert("Please select 1 to 5 images to upload.");
        return;
    }

    uploadStatus.textContent = `Uploading ${imageFiles.length} image(s)...`;

    try {
        // Step 1: Upload all images in parallel and get their URLs
        const uploadPromises = Array.from(imageFiles).map(file => {
            const storageRef = ref(storage, `listings/${currentUser.uid}/${Date.now()}_${file.name}`);
            return uploadBytes(storageRef, file).then(uploadResult => getDownloadURL(uploadResult.ref));
        });

        const imageUrls = await Promise.all(uploadPromises);
        uploadStatus.textContent = "Images uploaded! Saving listing...";

        // Step 2: Create the listing document with an array of image URLs
        const newListing = {
            title, description, price: +price, category,
            imageUrls: imageUrls, // Store an array of URLs
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