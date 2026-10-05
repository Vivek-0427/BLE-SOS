import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";


// Collection reference for contacts

const contactsCollectionRef = collection(db, "emergencyContacts");

// Get all contacts for a specific user

export const getContacts = async (userId) => {
    try {
        const q = query(contactsCollectionRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting contacts:", error);
        throw error;
    }
};

// Add a new contact for a specific user

export const addContact = async (userId, contact) => {
    const docref = await addDoc(contactsCollectionRef, {
        userId,
        ...contact,
        createdAt: serverTimestamp(),
    });
    return docref.id;
}

// Delete a contact by ID

export const deleteContact = async (contactId) => {
    const docref = doc(db, "emergencyContacts", contactId);
    await deleteDoc(docref);
}