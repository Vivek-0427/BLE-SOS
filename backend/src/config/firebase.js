import admin from "firebase-admin";
import { readFileSync } from "fs";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();
const messaging = admin.messaging();

export { admin, db, auth, messaging };
