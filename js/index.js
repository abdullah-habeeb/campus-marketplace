// js/index.js

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { categories } from './categories.js';

const listingsGrid = document.getElementById('listings-grid');
const logoutBtn = document.getElementById('logout-btn');
const searchBar = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');

let listingsListener = null; // To hold our real-time listener

// Main gatekeeper to check for logged-in user
onAuthStateChanged(auth, (user) => {
    if (user) {
        fetchAndDisplayListings(); // Initial fetch
        populateCategories();
    } else {
        window.location.href = 'login.html';
    }
});

// Add event listeners to our filter controls
searchBar.addEventListener('input', () => fetchAndDisplayListings());
categoryFilter.addEventListener('change', () => fetchAndDisplayListings());

// This is the main function that builds the query and gets the data
function fetchAndDisplayListings() {
    // If a real-time listener is already active, we must stop it before creating a new one
    if (listingsListener) {
        listingsListener(); // This detaches the old listener
    }

    const searchTerm = searchBar.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    // Start with a base query for all listings, sorted by newest first
    let q = query(collection(db, 'listings'), orderBy("postedAt", "desc"));

    // --- THIS IS THE FIX ---
    // If the user selected a specific category (not "all"),
    // we add another condition to our query.
    if (selectedCategory !== 'all') {
        q = query(q, where("category", "==", selectedCategory));
    }

    // Now, attach our real-time listener to the final query (q)
    listingsListener = onSnapshot(q, (snapshot) => {
        let listings = [];
        snapshot.docs.forEach((doc) => {
            const listing = { ...doc.data(), id: doc.id };
            // Since Firestore can't do "text contains" search, we filter by text on the client-side
            if (listing.title.toLowerCase().includes(searchTerm)) {
                listings.push(listing);
            }
        });
        displayListings(listings);
    });
}

// This function just handles drawing the cards on the screen
function displayListings(listings) {
    listingsGrid.innerHTML = '';
    if (listings.length === 0) {
        listingsGrid.innerHTML = '<p>No items found matching your criteria.</p>';
        return;
    }
    listings.forEach((listing) => {
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
}

// This function populates the category dropdown from our shared list
function populateCategories() {
    // Check if categories are already populated to avoid duplication
    if (categoryFilter.options.length > 1) return;

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Logout logic
logoutBtn.addEventListener('click', () => {
    signOut(auth);
});