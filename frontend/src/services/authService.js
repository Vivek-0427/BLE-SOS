import{
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";

import { auth } from "./firebase.js";
import { createUserProfile } from "./userService.js";

// Register a new user with email and password

export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await createUserProfile(user); // Create user profile in Firestore
        return user;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
};

// Sign in an existing user with email and password

export const logInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in user:", error);
        throw error;
    }
};

// Sign out the current user

export const logOutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out user:", error);
        throw error;
    }
};