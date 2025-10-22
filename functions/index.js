// functions/index.js - FINAL CORRECTED VERSION (v2 Firestore Triggers)
const { defineString } = require('firebase-functions/params');
const functions = require("firebase-functions"); // Keep v1 for config access for now
const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require("firebase-functions/v2/firestore"); // Import v2 Firestore triggers
const admin = require("firebase-admin");
const algoliasearch = require("algoliasearch");

admin.initializeApp();

// Initialize Algolia client using secure config
// Define the secrets using the v2 parameter method
const algoliaAppId = defineString("ALGOLIA_APP_ID"); // Matches the secret name if you set it like this
const algoliaAdminKey = defineString("ALGOLIA_API_KEY"); // Matches the secret name if you set it like this
const ALGOLIA_INDEX_NAME = "listings";

const algoliaClient = algoliasearch(algoliaAppId.value(), algoliaAdminKey.value());
const index = algoliaClient.initIndex(ALGOLIA_INDEX_NAME);

// --- Cloud Function triggered when a NEW listing is created (v2 Syntax) ---
exports.onListingCreated = onDocumentCreated("listings/{listingId}", (event) => {
    const snap = event.data; // Get the snapshot from the event object
    if (!snap) {
        console.error("No data associated with the event");
        return;
    }
    const listingData = snap.data();
    listingData.objectID = snap.id; // Use Firestore ID as Algolia objectID

    return index.saveObject(listingData)
        .then(() => functions.logger.info(`Listing ${snap.id} saved to Algolia.`)) // Use v1 logger for compatibility here
        .catch(error => functions.logger.error(`Error saving ${snap.id} to Algolia:`, error));
});

// --- Cloud Function triggered when a listing is UPDATED (v2 Syntax) ---
exports.onListingUpdated = onDocumentUpdated("listings/{listingId}", (event) => {
    const snapAfter = event.data.after; // Get the snapshot *after* the update
    if (!snapAfter) {
        console.error("No data associated with the event");
        return;
    }
    const updatedData = snapAfter.data();
    updatedData.objectID = snapAfter.id;

    return index.saveObject(updatedData)
        .then(() => functions.logger.info(`Listing ${snapAfter.id} updated in Algolia.`))
        .catch(error => functions.logger.error(`Error updating ${snapAfter.id} in Algolia:`, error));
});

// --- Cloud Function triggered when a listing is DELETED (v2 Syntax) ---
exports.onListingDeleted = onDocumentDeleted("listings/{listingId}", (event) => {
    const snap = event.data; // Get the snapshot of the deleted document
    if (!snap) {
        console.error("No data associated with the event");
        return;
    }
    const listingId = event.params.listingId; // Get ID from event parameters

    return index.deleteObject(listingId)
        .then(() => functions.logger.info(`Listing ${listingId} deleted from Algolia.`))
        .catch(error => functions.logger.error(`Error deleting ${listingId} from Algolia:`, error));
});

// --- Keep your emailReminder function if it exists ---
// const { onSchedule } = require("firebase-functions/v2/scheduler");
// ... your emailReminder code ...