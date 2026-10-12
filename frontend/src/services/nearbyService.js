import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

import { db } from "./firebase";


// Save/update current user's location
export const updateUserLocation = async ({
  userId,
  latitude,
  longitude,
  accuracy = null,
  sharingEnabled = false
}) => {

  if (!userId || latitude == null || longitude == null) {
    throw new Error("Invalid location data");
  }

  const locationRef = doc(db, "userLocations", userId);

  await setDoc(
    locationRef,
    {
      userId,
      latitude,
      longitude,
      accuracy,
      sharingEnabled,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  console.log("📍 User location updated");
};

// Start Location Tracking
    
export const startLocationTracking = (userId, sharingEnabled = false) => {
  if (!userId) return null;

  if (!navigator.geolocation) {
    console.error("❌ Geolocation is not supported");
    return null;
  }

  console.log("📍 Starting location tracking...");

  const watchId = navigator.geolocation.watchPosition(
    async (position) => {
      try {
        const { latitude, longitude, accuracy } = position.coords;

        console.log("📍 New location:", {
          latitude,
          longitude,
          accuracy
        });

        await updateUserLocation({
          userId,
          latitude,
          longitude,
          accuracy,
          sharingEnabled
        });

      } catch (error) {
        console.error("❌ Failed to update location:", error);
      }
    },

    (error) => {
      console.error("❌ Location tracking error:", error.message);
    },

    {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 10000
    }
  );

  return watchId;
};

// Stop Location Tracking

export const stopLocationTracking = (watchId) => {
  if (watchId !== null && watchId !== undefined) {
    navigator.geolocation.clearWatch(watchId);
    console.log("🛑 Location tracking stopped");
  }
};

// Listen for real-time nearby SOS notifications
export const listenForNearbySOS = (userId, onNotifications, onError) => {
  if (!userId) {
    console.error("Cannot listen for notifications: userId is missing");
    return () => {};
  }

  const notificationsRef = collection(
    db,
    "notifications",
    userId,
    "items"
  );

  const notificationsQuery = query(
    notificationsRef,
    orderBy("createdAt", "desc")
  );

  const unsubscribe = onSnapshot(
    notificationsQuery,
    (snapshot) => {
      const notifications = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data()
      }));

      onNotifications(notifications);
    },
    (error) => {
      console.error("Error listening for nearby SOS notifications:", error);

      if (onError) {
        onError(error);
      }
    }
  );

  return unsubscribe;
};