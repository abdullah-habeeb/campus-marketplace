// js/chat.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const logoutBtn = document.getElementById('logout-btn');
let currentUser = null;

const params = new URLSearchParams(window.location.search);
const chatId = params.get('id');

onAuthStateChanged(auth, (user) => {
    if (user && chatId) {
        currentUser = user;
        listenForMessages();
    } else {
        window.location.href = 'login.html';
    }
});

function listenForMessages() {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy("timestamp"));

    onSnapshot(q, (snapshot) => {
        messagesContainer.innerHTML = '';
        snapshot.docs.forEach(doc => {
            const message = doc.data();
            const messageEl = document.createElement('div');
            messageEl.classList.add('message');
            messageEl.classList.add(message.senderId === currentUser.uid ? 'sent' : 'received');
            messageEl.textContent = message.text;
            messagesContainer.appendChild(messageEl);
        });
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser || !chatId) return;
    const messageText = messageInput.value;
    if (messageText.trim() === '') return;

    try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
            text: messageText,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        });

        // Also update the last message on the parent chat document
        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
            lastMessage: messageText,
            lastUpdated: serverTimestamp()
        });

        messageInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
    }
});

logoutBtn.addEventListener('click', () => signOut(auth));