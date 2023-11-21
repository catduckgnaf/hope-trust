import config from "./config";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: config.google.FIREBASE_API_KEY,
  authDomain: "hope-trust-608f4.firebaseapp.com",
  databaseURL: "https://hope-trust-608f4-default-rtdb.firebaseio.com",
  projectId: "hope-trust-608f4",
  storageBucket: "hope-trust-608f4.appspot.com",
  messagingSenderId: "525137597025",
  appId: "1:525137597025:web:2e671a29b25a6c9a83d020"
};

const firebase_app = initializeApp(firebaseConfig);
export default firebase_app;