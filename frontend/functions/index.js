// Firebase Cloud Functions for SOS App

/* global require, exports */
/* eslint-disable no-undef */

const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");

const { initializeApp } = require("firebase-admin/app");

const {
  getFirestore,
  FieldValue
} = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

const RADIUS_METERS = 100;
const MAX_LOCATION_AGE_MS = 2 * 60 * 1000;


// Calculate distance between two GPS coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371000;

  const toRadians = (degrees) => {
    return (degrees * Math.PI) / 180;
  };

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return earthRadius * c;
}


// Check whether a location is recent
function isLocationRecent(location) {
  if (!location.updatedAt) return false;

  const updatedAt = location.updatedAt.toMillis();

  return (
    Date.now() - updatedAt <= MAX_LOCATION_AGE_MS &&
    updatedAt <= Date.now() + 5000
  );
}


// Run when a new SOS event is created
exports.detectNearbySOS = onDocumentCreated(
  "sosEvents/{sosId}",
  async (event) => {
    const sos = event.data?.data();

    if (!sos || sos.status !== "ACTIVE" || !sos.userId) {
      console.log("Ignoring invalid or inactive SOS");
      return;
    }

    const senderId = sos.userId;
    const sosId = event.params.sosId;

    console.log("🚨 New SOS:", sosId);

    // Get the sender's latest location
    const senderSnapshot = await db
      .collection("userLocations")
      .doc(senderId)
      .get();

    if (!senderSnapshot.exists) {
      console.log("Sender location not found");
      return;
    }

    const sender = senderSnapshot.data();

    if (
      typeof sender.latitude !== "number" ||
      typeof sender.longitude !== "number" ||
      !isLocationRecent(sender)
    ) {
      console.log("Sender location is invalid or stale");
      return;
    }

    // Find users who have enabled Available to Help
    const helpersSnapshot = await db
      .collection("userLocations")
      .where("sharingEnabled", "==", true)
      .get();

    const notificationWrites = [];

    for (const helperDoc of helpersSnapshot.docs) {
      const helperId = helperDoc.id;
      const helper = helperDoc.data();

      // Don't notify the person who triggered SOS
      if (helperId === senderId) continue;

      // Ignore stale or invalid helper locations
      if (
        typeof helper.latitude !== "number" ||
        typeof helper.longitude !== "number" ||
        !isLocationRecent(helper)
      ) {
        continue;
      }

      const distance = calculateDistance(
        sender.latitude,
        sender.longitude,
        helper.latitude,
        helper.longitude
      );

      console.log(
        `Helper ${helperId}: ${Math.round(distance)} m`
      );

      if (distance <= RADIUS_METERS) {
        // Deterministic ID prevents duplicate documents on retries
        const notificationRef = db
          .collection("notifications")
          .doc(helperId)
          .collection("items")
          .doc(sosId);

        notificationWrites.push(notificationRef.set({
          type: "NEARBY_SOS",
          sosId,

          message: "Someone nearby needs emergency help.",

          // Distance between the helper and the person in danger
          distanceMeters: Math.round(distance),

          // Destination coordinates for Google Maps
          destinationLatitude: sender.latitude,
          destinationLongitude: sender.longitude,

          status: "UNREAD",

          createdAt: FieldValue.serverTimestamp()
        }, { merge: true }));
      }
    }

    await Promise.all(notificationWrites);

    // Update the actual number of successfully notified helpers
    await db
      .collection("sosEvents")
      .doc(sosId)
      .update({
        peersReached: notificationWrites.length
      });

    console.log(
      `✅ Nearby SOS processing complete. ` +
      `${notificationWrites.length} helper(s) notified.`
    );
  }
);

// Update helper notifications when an SOS is cancelled
exports.handleSOSCancellation = onDocumentUpdated(
  {
    document: "sosEvents/{sosId}",
    region: "asia-south1"
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) {
      console.log("Missing SOS document data.");
      return;
    }

    // Process only ACTIVE -> CANCELLED
    if (
      before.status !== "ACTIVE" ||
      after.status !== "CANCELLED"
    ) {
      return;
    }

    const sosId = event.params.sosId;

    console.log("Processing SOS cancellation:", sosId);

    try {
      // Search all items subcollections for this SOS ID.
      const notificationsSnapshot = await db
        .collectionGroup("items")
        .where("sosId", "==", sosId)
        .get();

      let updatedCount = 0;

      for (const notificationDoc of notificationsSnapshot.docs) {
        const notification = notificationDoc.data();

        if (notification.type !== "NEARBY_SOS") {
          continue;
        }

        await notificationDoc.ref.update({
          message: "The person has cancelled the SOS. They are safe.",
          status: "CANCELLED",
          cancelledAt: FieldValue.serverTimestamp()
        });

        updatedCount++;

        console.log("Updated helper notification:", {
          notificationPath: notificationDoc.ref.path,
          sosId
        });
      }

      console.log(
        `SOS cancellation complete. Updated ${updatedCount} notification(s).`
      );

      if (updatedCount === 0) {
        console.warn(
          "No notification found with sosId:",
          sosId
        );
      }
    } catch (error) {
      console.error(
        "Failed to update SOS cancellation notifications:",
        error
      );
      throw error;
    }
  }
);