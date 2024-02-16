// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBI9IxAtUfAVxFcUs1uTbOF86ChtSNypsE",
  authDomain: "triviachatapp.firebaseapp.com",
  projectId: "triviachatapp",
  storageBucket: "triviachatapp.appspot.com",
  messagingSenderId: "98171997455",
  appId: "1:98171997455:web:aee71235655f4212fcc27a",
  measurementId: "G-Z8R8M1LRVE",
  databaseURL : "https://triviachatapp-default-rtdb.firebaseio.com/",


};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

