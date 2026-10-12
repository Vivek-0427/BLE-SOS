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

        notificationWrites.push(
          notificationRef.set({
            type: "NEARBY_SOS",
            sosId,
            message: "Someone nearby needs emergency help.",
            distanceMeters: Math.round(distance),
            status: "UNREAD",
            createdAt: FieldValue.serverTimestamp()
          }, { merge: true })
        );
      }
    }

    await Promise.all(notificationWrites);

    console.log(
      `✅ Nearby SOS processing complete. ` +
      `${notificationWrites.length} helper(s) notified.`
    );
  }
);

// Update notifications when an SOS is cancelled
exports.handleSOSCancellation = onDocumentUpdated(
  "sosEvents/{sosId}",
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    // Process only a transition from ACTIVE to CANCELLED
    if (
      before.status !== "ACTIVE" ||
      after.status !== "CANCELLED"
    ) {
      return;
    }

    const sosId = event.params.sosId;

    console.log("🚨 SOS cancelled:", sosId);

    const notificationsSnapshot = await db
      .collection("notifications")
      .get();

    const updates = [];

    for (const recipientDoc of notificationsSnapshot.docs) {
      const notificationRef = recipientDoc.ref
        .collection("items")
        .doc(sosId);

      const notificationSnapshot = await notificationRef.get();

      if (!notificationSnapshot.exists) {
        continue;
      }

      const notification = notificationSnapshot.data();

      // Update only recipients who received this SOS
      if (notification.type !== "NEARBY_SOS") {
        continue;
      }

      updates.push(
        notificationRef.set(
          {
            type: "SOS_CANCELLED",
            message: "The nearby emergency alert has been cancelled.",
            status: "CANCELLED",
            cancelledAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        )
      );
    }

    await Promise.all(updates);

    console.log(
      `✅ Updated ${updates.length} SOS cancellation notification(s)`
    );
  }
);