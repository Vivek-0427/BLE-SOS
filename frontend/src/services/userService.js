import { doc,setDoc,getDoc,serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

// Create user profile

export const createUserProfile = async (user) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid);
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    createdAt: serverTimestamp(),
    role: "user", // Default role
  });
};

// Get user profile

export const getUserProfile = async (uid) => {
  if (!uid) return null;
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};