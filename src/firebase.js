import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace these with your actual keys if you want it to work, 
// or leave them blank/dummy for the demo build.
const firebaseConfig = {
  apiKey: "DEMO_MODE_ACTIVE",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "00000000",
  appId: "0:00000000:web:0000"
};

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Export the db. Even in demo mode, this will keep the app from crashing.
export const db = getFirestore(app);
export { app };