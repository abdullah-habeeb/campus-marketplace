// js/item-details.js

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const itemDetailsContainer = document.getElementById('item-details-container');
const logoutBtn = document.getElementById('logout-btn');
let currentItem = null; // Store the current item globally on this page
let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadItemDetails();
    } else {
        window.location.href = 'login.html';
    }
});

async function loadItemDetails() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');
    if (!itemId) { return; }

    try {
        const itemDoc = await getDoc(doc(db, 'listings', itemId));
        if (itemDoc.exists()) {
            currentItem = { ...itemDoc.data(), id: itemDoc.id };
            displayItemDetails(currentItem);
        }
    } catch (error) { console.error("Error fetching details:", error); }
}

function displayItemDetails(item) {
    const postedDate = item.postedAt.toDate().toLocaleDateString('en-IN');
    const imageSources = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl];

    itemDetailsContainer.innerHTML = `
        <a href="index.html" class="back-link">← Back to Marketplace</a>
        <div class="item-details-layout">
            <div class="item-image-container">
                <img src="${imageSources[0]}" alt="${item.title}" id="main-image">
                ${imageSources.length > 1 ? `<div class="gallery-controls"><button id="prev-btn">‹</button><button id="next-btn">›</button></div>` : ''}
            </div>
            <div class="item-info-container">
                <h1>${item.title}</h1>
                <p class="price">₹${item.price}</p>
                <h3>Description</h3>
                <p>${item.description}</p>
                <hr>
                <div class="seller-info">
                    <p><strong>Category:</strong> ${item.category}</p>
                    <p><strong>Sold by:</strong> ${item.sellerName}</p>
                    <p><strong>Posted on:</strong> ${postedDate}</p>
                </div>
                <a href="#" class="btn" id="contact-seller-btn">Contact Seller</a>
                <div id="owner-controls" class="hidden">
                    <button class="btn btn-danger" id="delete-item-btn">Delete Item</button>
                </div>
            </div>
        </div>
    `;

    // --- Show owner controls if the current user is the seller ---
    if (currentUser && currentUser.uid === item.sellerId) {
        document.getElementById('owner-controls').classList.remove('hidden');
        document.getElementById('delete-item-btn').addEventListener('click', handleDeleteItem);
    }

    // --- Gallery Logic ---
    if (imageSources.length > 1) { /* ... gallery logic from before ... */ }
}

// --- NEW: Function to handle item deletion ---
async function handleDeleteItem() {
    if (!currentItem) return;

    // Show a confirmation pop-up
    const isConfirmed = confirm("Are you sure you want to permanently delete this listing?");

    if (isConfirmed) {
        try {
            await deleteDoc(doc(db, 'listings', currentItem.id));
            alert("Listing deleted successfully.");
            window.location.href = 'index.html'; // Go back to home
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("There was an error deleting your listing.");
        }
    }
}

logoutBtn.addEventListener('click', () => signOut(auth));