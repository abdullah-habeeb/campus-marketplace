// js/post-item.js

import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
import { categories } from './categories.js'; // Import the shared categories

// --- Get HTML Elements ---
const postItemForm = document.getElementById('post-item-form');
const uploadStatus = document.getElementById('upload-status');
const categorySelect = document.getElementById('item-category'); // Get the select element
let currentUser = null;
let userProfile = null;

// --- Function to populate the category dropdown ---
function populateCategories() {
    // Check if options already exist to prevent duplicates on potential reloads
    if (categorySelect.options.length > 1) return; 
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// --- Gatekeeper: Check login status and fetch user profile ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                userProfile = userDoc.data();
            } else {
                // This might happen if the user signed up but profile creation failed
                console.error("User profile not found in Firestore!");
                // Optionally redirect to complete profile or show an error
                alert("Could not load user profile. Please log out and back in.");
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            alert("Could not load user profile.");
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
        alert("User data not loaded. Please wait a moment or log in again."); 
        return; 
    }

    // Get form values
    const title = document.getElementById('item-title').value;
    const description = document.getElementById('item-description').value;
    const price = document.getElementById('item-price').value;
    const category = categorySelect.value;
    const imageFiles = document.getElementById('item-image').files;

    // Basic validation
    if (!category) { 
        alert("Please select a category."); 
        return; 
    }
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

        // Wait for all uploads to complete
        const imageUrls = await Promise.all(uploadPromises);
        uploadStatus.textContent = "Images uploaded! Saving listing...";

        // Step 2: Create the listing document data
        const newListing = {
            title: title,
            description: description,
            price: +price, // Convert price string to number
            category: category,
            imageUrls: imageUrls, // Store the array of URLs
            sellerId: currentUser.uid,
            sellerName: userProfile.name, // Use name from fetched profile
            collegeId: userProfile.collegeId, // Use collegeId from fetched profile
            postedAt: new Date(),
            isSold: false
        };

        // Step 3: Add the document to Firestore
        await addDoc(collection(db, 'listings'), newListing);
        
        uploadStatus.textContent = "Listing posted successfully! Redirecting...";
        
        // Redirect to homepage after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500); // Slightly shorter delay

    } catch (error) {
        console.error("Error posting item:", error);
        uploadStatus.textContent = `Error: ${error.message}`;
        alert("There was an error posting your item. Please try again.");
    }
});

// --- Run populateCategories when the page loads ---
populateCategories();