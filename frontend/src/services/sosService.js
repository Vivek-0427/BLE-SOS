import{
    collection,
    addDoc,
    serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

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
        timestamp: serverTimestamp(),
        latitude,
        longitude,
        initialttl: ttl,
        ttl,
    }

    const docRef = await addDoc(collection(db, "sosEvents"), sosData);

    return { id: docRef.id, ...sosData };
};

// Get SOS events for a specific user
export const getUserSOSEvents = async (userId) => {
    const q = query(collection(db, "sosEvents"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};