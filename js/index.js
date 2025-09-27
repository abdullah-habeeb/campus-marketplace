// js/index.js

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Get HTML Elements ---
const listingsGrid = document.getElementById('listings-grid');
const logoutBtn = document.getElementById('logout-btn');
const postItemLink = document.getElementById('post-item-link'); // We will add this to the HTML

// --- Gatekeeper ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is logged in, fetch and display listings
        listenForListings();
    } else {
        // No user, redirect to login
        window.location.href = 'login.html';
    }
});

// --- Fetch and Display Listings ---
function listenForListings() {
    const listingsCollection = collection(db, 'listings');
    const q = query(listingsCollection, orderBy("postedAt", "desc")); // Get newest items first

    onSnapshot(q, (snapshot) => {
        listingsGrid.innerHTML = ''; // Clear existing listings
        snapshot.docs.forEach((doc) => {
            const listing = { ...doc.data(), id: doc.id };
            const listingCard = document.createElement('div');
            listingCard.classList.add('listing-card');
            listingCard.innerHTML = `
                <img src="${listing.imageUrl}" alt="${listing.title}">
                <div class="card-content">
                    <h4>${listing.title}</h4>
                    <p class="price">₹${listing.price}</p>
                    <small>Sold by: ${listing.sellerName}</small>
                </div>
            `;
            listingsGrid.appendChild(listingCard);
        });
    });
}

// --- Logout Logic ---
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});