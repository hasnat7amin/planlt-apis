// Import the functions you need from the SDKs you need
const  { initializeApp } = require( "firebase/app");
require( 'firebase/storage');
const { getStorage } =require( 'firebase/storage');


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbNBtRcLC3DK-QBs4QCUfvaVvY05ncBm8",
  authDomain: "planlt.firebaseapp.com",
  projectId: "planlt",
  storageBucket: "planlt.appspot.com",
  messagingSenderId: "1031200359254",
  appId: "1:1031200359254:web:3b07551feb616761e90cf7"
}; 

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const storage = getStorage(firebase);
module.exports = {firebase,storage};
