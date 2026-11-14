// Feedback Service for submitting user feedback to Firebase Firestore.

import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

export const submitFeedback = async (feedbackData) => {

  const feedbackRef = await addDoc(
    collection(db, "feedback"),
    {
      ...feedbackData,
      status: "NEW",
      createdAt: serverTimestamp()
    }
  );

  return feedbackRef.id;
};