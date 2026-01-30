import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBlocwxGBIXgUAIknp86iYXkaRG03Z09xk",
  authDomain: "cooldown-89faa.firebaseapp.com",
  projectId: "cooldown-89faa",
  storageBucket: "cooldown-89faa.firebasestorage.app",
  messagingSenderId: "463360148211",
  appId: "1:463360148211:web:274277875aad4762666d86",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);