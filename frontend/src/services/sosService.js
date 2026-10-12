import{
    doc,
    updateDoc,
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

import { encryptSOSData, decryptSOSData } from "./cryptoService";

// Create a new SOS event

export const createSOSEvent = async({
    userId,
    type = "MANUAL",
    source = "USER",
    latitude= null,
    longitude= null,
    ttl=5

})=>{

    const sosData={
        userId,
        type,
        source,
        status: "ACTIVE",
        timestamp: new Date().toISOString(),
        latitude,
        longitude,
        initialTTl: ttl,
        ttl,
    }

    // Encrypt sensitive SOS information
  const encrypted = await encryptSOSData(sosData);

  const firestoreData = {
    userId,
    encryptedData: encrypted.encryptedData,
    iv: encrypted.iv,
    status: "ACTIVE",
    createdAt: serverTimestamp()
  };

  const docRef = await addDoc(
    collection(db, "sosEvents"),
    firestoreData
  );

  return {
    id: docRef.id,
    ...firestoreData
  };
};


// Get user's SOS history
export const getUserSOSEvents = async (userId) => {

  if (!userId) return [];

  const q = query(
    collection(db, "sosEvents"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  const events = [];

  for (const document of snapshot.docs) {

    const data = document.data();

    // New encrypted SOS

    if (data.encryptedData && data.iv) {

    try {

      const decryptedData = await decryptSOSData({
        encryptedData: data.encryptedData,
        iv: data.iv
      });

      events.push({
        id: document.id,

        ...decryptedData,

        status: data.status,

        createdAt: data.createdAt
      });

    } catch (error) {

      console.error(
        "❌ Failed to decrypt SOS event:",
        document.id,
        error
      );

      // Still show the event even if decryption fails
      events.push({
        id: document.id,
        status: data.status,
        createdAt: data.createdAt,
        decryptionFailed: true
      });
    }
  }else {
    // Old unencrypted SOS
    events.push({
      id: document.id,
      ...data
    });
  }
}

  return events;
};

// Cancel an existing SOS event
export const cancelSOSEvent = async (sosId) => {
  if (!sosId) {
    throw new Error("SOS event ID is required");
  }

  const sosRef = doc(db, "sosEvents", sosId);

  await updateDoc(sosRef, {
    status: "CANCELLED",
    cancelledAt: serverTimestamp()
  });

  return true;
};