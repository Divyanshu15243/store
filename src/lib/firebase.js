import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIqBtgZTmRRGMvAKskMQUVg78e8Yg9IAI",
  authDomain: "n23-gujarati-basket.firebaseapp.com",
  projectId: "n23-gujarati-basket",
  storageBucket: "n23-gujarati-basket.firebasestorage.app",
  messagingSenderId: "65391847708",
  appId: "1:65391847708:web:7741f0339e31821687b2d9",
  measurementId: "G-T9D1YPLFLF",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };
