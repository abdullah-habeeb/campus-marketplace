// js/index.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { collection, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { categories } from './categories.js';

// --- Get Elements ---
const listingsGrid = document.getElementById('listings-grid');
const logoutBtn = document.getElementById('logout-btn');
const searchBar = document.getElementById('search-bar');
const categoryFilter = document.getElementById('category-filter');
const openSidebarBtn = document.getElementById('open-sidebar-btn');
const closeSidebarBtn = document.getElementById('close-sidebar-btn');
const sidebar = document.getElementById('sidebar');
const allListingsLink = document.getElementById('all-listings-link');
const myListingsLink = document.getElementById('my-listings-link');
const listingsTitle = document.getElementById('listings-title');

let listingsListener = null;
let currentUser = null;

// --- Gatekeeper ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        fetchAndDisplayListings(); // Fetch all listings by default
        populateCategories();
    } else {
        window.location.href = 'login.html';
    }
});

// --- Event Listeners ---
searchBar.addEventListener('input', () => fetchAndDisplayListings());
categoryFilter.addEventListener('change', () => fetchAndDisplayListings());
openSidebarBtn.addEventListener('click', () => sidebar.style.width = "250px");
closeSidebarBtn.addEventListener('click', () => sidebar.style.width = "0");
allListingsLink.addEventListener('click', () => {
    listingsTitle.textContent = "Latest Listings";
    fetchAndDisplayListings(); // Fetch all
    sidebar.style.width = "0";
});
myListingsLink.addEventListener('click', () => {
    listingsTitle.textContent = "Your Listings";
    fetchAndDisplayListings(true); // Fetch only my listings
    sidebar.style.width = "0";
});

// --- Main Fetch Function ---
function fetchAndDisplayListings(myListingsOnly = false) {
    if (listingsListener) { listingsListener(); }

    const searchTerm = searchBar.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let q = query(collection(db, 'listings'), orderBy("postedAt", "desc"));
    if (selectedCategory !== 'all') { q = query(q, where("category", "==", selectedCategory)); }
    if (myListingsOnly && currentUser) { q = query(q, where("sellerId", "==", currentUser.uid)); }

    listingsListener = onSnapshot(q, (snapshot) => {
        let listings = [];
        snapshot.docs.forEach((doc) => {
            const listing = { ...doc.data(), id: doc.id };
            if (listing.title.toLowerCase().includes(searchTerm)) {
                listings.push(listing);
            }
        });
        displayListings(listings);
    }, (error) => {
        console.error("Firestore query failed. You may need to create an index:", error);
    });
}

// --- Display & Populate Functions (Mostly Unchanged) ---
// in js/index.js

function displayListings(listings) {
    listingsGrid.innerHTML = '';
    if (listings.length === 0) {
        listingsGrid.innerHTML = '<p>No items found.</p>';
        return;
    }
    listings.forEach((listing) => {
        const link = document.createElement('a');
        link.href = `item-details.html?id=${listing.id}`;
        link.classList.add('listing-card-link');

        // --- THIS IS THE CORRECTED PART ---
        // We are adding the full HTML for the card here
        link.innerHTML = `
            <div class="listing-card">
                <img src="${listing.imageUrls ? listing.imageUrls[0] : listing.imageUrl}" alt="${listing.title}">
                <div class="card-content">
                    <h4>${listing.title}</h4>
                    <p class="price">₹${listing.price}</p>
                    <small>Sold by: ${listing.sellerName}</small>
                </div>
            </div>
        `;
        // --- END OF CORRECTION ---

        listingsGrid.appendChild(link);
    });
}

function populateCategories() {
    if (categoryFilter.options.length > 1) return;
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category; option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

logoutBtn.addEventListener('click', () => signOut(auth));