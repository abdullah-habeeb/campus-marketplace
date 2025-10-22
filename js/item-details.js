// js/item-details.js - FINAL DEBUGGED VERSION

import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

console.log("item-details.js: Script started.");

const itemDetailsContainer = document.getElementById('item-details-container');
const logoutBtn = document.getElementById('logout-btn');
let currentItem = null;
let currentUser = null;

// --- Gatekeeper ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("item-details.js: User is logged in.", user.email);
        currentUser = user;
        loadItemDetails();
    } else {
        window.location.href = 'login.html';
    }
});

// --- Main Function to Load Item Details ---
async function loadItemDetails() {
    console.log("item-details.js: loadItemDetails started.");
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get('id');

    if (!itemId) { console.error("No item ID in URL."); return; }

    try {
        const itemDoc = await getDoc(doc(db, 'listings', itemId));
        if (itemDoc.exists()) {
            console.log("item-details.js: Document found, preparing to display.");
            currentItem = { ...itemDoc.data(), id: itemDoc.id };
            displayItemDetails(currentItem);
        } else {
            console.error("item-details.js: Document does not exist.");
        }
    } catch (error) {
        console.error("Error fetching item details:", error);
    }
}

// --- Function to Display the Details on the Page ---
function displayItemDetails(item) {
    console.log("item-details.js: displayItemDetails started for item:", item.title);
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
                    <p><strong>Sold by:</strong> <a href="profile.html?id=${item.sellerId}" class="seller-link">${item.sellerName}</a></p>
                    <p><strong>Posted on:</strong> ${postedDate}</p>
                </div>
                <div id="contact-seller-container"></div>
                <div id="owner-controls" class="hidden">
                    <button class="btn btn-secondary" id="mark-sold-btn">Mark as Sold</button>
                    <button class="btn btn-danger" id="delete-item-btn">Delete Item</button>
                </div>
            </div>
        </div>
    `;

    // --- ATTACH LISTENERS AFTER rendering the HTML ---
    if (currentUser && currentUser.uid !== item.sellerId) {
        const contactBtn = document.createElement('a');
        contactBtn.href = '#';
        contactBtn.className = 'btn';
        contactBtn.id = 'contact-seller-btn';
        contactBtn.textContent = 'Contact Seller';
        contactBtn.addEventListener('click', (e) => {
            console.log("item-details.js: Contact Seller button clicked."); // DIAGNOSTIC
            e.preventDefault();
            initiateChat(item.sellerId);
        });
        document.getElementById('contact-seller-container').appendChild(contactBtn);
    }

    if (currentUser && currentUser.uid === item.sellerId) {
        // ... (delete and mark sold logic is the same)
    }

    if (imageSources.length > 1) {
        // ... (gallery logic is the same)
    }
}

// --- Function to find or create a chat ---
async function initiateChat(sellerId) {
    console.log("item-details.js: initiateChat started."); // DIAGNOSTIC
    if (!currentUser) return;
    const buyerId = currentUser.uid;
    const chatId = buyerId > sellerId ? `${buyerId}_${sellerId}` : `${sellerId}_${buyerId}`;
    const chatDocRef = doc(db, 'chats', chatId);

    try {
        const chatDoc = await getDoc(chatDocRef);
        if (!chatDoc.exists()) {
            console.log("item-details.js: Chat does not exist. Creating new chat."); // DIAGNOSTIC
            await setDoc(chatDocRef, {
                participants: [buyerId, sellerId],
                createdAt: new Date()
            });
        }
        console.log("item-details.js: Redirecting to chat page:", chatId); // DIAGNOSTIC
        window.location.href = `chat.html?id=${chatId}`;
    } catch (error) {
        console.error("Error initiating chat:", error);
    }
}

// ... (rest of your functions: handleDeleteItem, handleMarkAsSold, logoutBtn listener)