import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBlocwxGBIXgUAIknp86iYXkaRG03Z09xk",
  authDomain: "cooldown-89faa.firebaseapp.com",
  projectId: "cooldown-89faa",
  storageBucket: "cooldown-89faa.firebasestorage.app",
  messagingSenderId: "463360148211",
  appId: "1:463360148211:web:274277875aad4762666d86",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 直接匯出 auth，不使用複雜的 persistence 設定
export const auth = getAuth(app);