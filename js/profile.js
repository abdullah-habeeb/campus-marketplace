// js/profile.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const profileContainer = document.getElementById('profile-container');
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadProfileDetails();
    } else {
        window.location.href = 'login.html';
    }
});

async function loadProfileDetails() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('id');
    if (!userId) { profileContainer.innerHTML = 'User not found.'; return; }

    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            displayProfile(userDoc.data());
            fetchSellerListings(userId);
        }
    } catch (error) { console.error("Error fetching profile:", error); }
}

function displayProfile(userData) {
    profileContainer.innerHTML = `
        <div class="profile-card">
            <h2>${userData.name}</h2>
            <p><strong>Email:</strong> ${userData.email}</p>
        </div>
        <h3>Listings from this seller:</h3>
        <div id="seller-listings-grid" class="listings-grid">
            <p>Loading listings...</p>
        </div>
    `;
}

function fetchSellerListings(sellerId) {
    const listingsGrid = document.getElementById('seller-listings-grid');
    const q = query(collection(db, 'listings'), where("sellerId", "==", sellerId));

    onSnapshot(q, (snapshot) => {
        listingsGrid.innerHTML = '';
        if (snapshot.empty) {
            listingsGrid.innerHTML = '<p>This user has no active listings.</p>';
            return;
        }
        snapshot.docs.forEach(doc => {
            const listing = { ...doc.data(), id: doc.id };
            const listingCardLink = document.createElement('a');
            listingCardLink.href = `item-details.html?id=${listing.id}`;
            listingCardLink.classList.add('listing-card-link');
            
            const card = document.createElement('div');
            card.classList.add('listing-card');
            if (listing.isSold) {
                card.classList.add('sold');
            }

            card.innerHTML = `
                <img src="${listing.imageUrls[0]}" alt="${listing.title}">
                <div class="card-content">
                    <h4>${listing.title}</h4>
                    <p class="price">₹${listing.price}</p>
                </div>
                ${listing.isSold ? '<div class="sold-badge">SOLD</div>' : ''}
            `;
            listingCardLink.appendChild(card);
            listingsGrid.appendChild(listingCardLink);
        });
    });
}