import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { 
  getDatabase, 
  ref, 
  set, 
  update, 
  remove, 
  onValue 
} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-database.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACkIZUx50LbxfgvW606eLaD6XhwNxIOuM",
  authDomain: "memberr-card.firebaseapp.com",
  databaseURL: "https://memberr-card-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "memberr-card",
  storageBucket: "memberr-card.firebasestorage.app",
  messagingSenderId: "532758260849",
  appId: "1:532758260849:web:309f8d8db5df773e64ffd0",
  measurementId: "G-CRH5Z9NQ6S"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export fungsi yang dibutuhkan
export { db, ref, set, update, remove, onValue };