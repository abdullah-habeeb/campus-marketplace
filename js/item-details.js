// js/item-details.js - FINAL CORRECTED VERSION
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const itemDetailsContainer = document.getElementById('item-details-container');
const logoutBtn = document.getElementById('logout-btn');
let currentItem = null;
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
    if (!itemId) { itemDetailsContainer.innerHTML = 'Item not found.'; return; }

    try {
        const itemDoc = await getDoc(doc(db, 'listings', itemId));
        if (itemDoc.exists()) {
            currentItem = { ...itemDoc.data(), id: itemDoc.id };
            displayItemDetails(currentItem);
        } else {
            itemDetailsContainer.innerHTML = 'This item does not exist.';
        }
    } catch (error) { console.error("Error fetching details:", error); }
}

// in js/item-details.js

// in js/item-details.js

function displayItemDetails(item) {
  const postedDate = item.postedAt.toDate().toLocaleDateString('en-IN');
  const imageSources = item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : [item.imageUrl];

  itemDetailsContainer.innerHTML = `
      <a href="index.html" class="back-link">← Back to Marketplace</a>
      <div class="item-details-layout">
          <div class="item-image-container">
              <img src="${imageSources[0]}" alt="${item.title}" id="main-image">
              ${imageSources.length > 1 ? `
              <div class="gallery-controls">
                  <button id="prev-btn">‹</button>
                  <button id="next-btn">›</button>
              </div>
              ` : ''}
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
              <div id="contact-seller-container"></div>
              <div id="owner-controls" class="hidden">
                  <button class="btn btn-danger" id="delete-item-btn">Delete Item</button>
              </div>
          </div>
      </div>
  `;

  // --- THIS IS THE FIX ---
  // The logic for the gallery buttons and owner controls goes here.
  
  // Show owner controls if the current user is the seller
  if (currentUser && currentUser.uid === item.sellerId) {
      document.getElementById('owner-controls').classList.remove('hidden');
      document.getElementById('delete-item-btn').addEventListener('click', handleDeleteItem);
  }
  
  // Add contact button if the current user is NOT the seller
  if (currentUser && currentUser.uid !== item.sellerId) {
      const contactBtn = document.createElement('a');
      contactBtn.href = '#';
      contactBtn.className = 'btn';
      contactBtn.id = 'contact-seller-btn';
      contactBtn.textContent = 'Contact Seller';
      contactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          initiateChat(item.sellerId);
      });
      document.getElementById('contact-seller-container').appendChild(contactBtn);
  }

  // Add gallery logic ONLY if there is more than one image
  if (imageSources.length > 1) {
      let currentImageIndex = 0;
      const mainImage = document.getElementById('main-image');
      const prevBtn = document.getElementById('prev-btn');
      const nextBtn = document.getElementById('next-btn');
      
      const updateImage = () => { mainImage.src = imageSources[currentImageIndex]; };

      prevBtn.addEventListener('click', () => {
          currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : imageSources.length - 1;
          updateImage();
      });

      nextBtn.addEventListener('click', () => {
          currentImageIndex = (currentImageIndex < imageSources.length - 1) ? currentImageIndex + 1 : 0;
          updateImage();
      });
  }
}

async function initiateChat(sellerId) {
    if (!currentUser) return;
    const buyerId = currentUser.uid;
    const chatId = buyerId > sellerId ? `${buyerId}_${sellerId}` : `${sellerId}_${buyerId}`;
    const chatDocRef = doc(db, 'chats', chatId);
    try {
        const chatDoc = await getDoc(chatDocRef);
        if (!chatDoc.exists()) {
            await setDoc(chatDocRef, { participants: [buyerId, sellerId], createdAt: new Date() });
        }
        window.location.href = `chat.html?id=${chatId}`;
    } catch (error) { console.error("Error initiating chat:", error); }
}

async function handleDeleteItem() { /* ... unchanged ... */ }
logoutBtn.addEventListener('click', () => signOut(auth));