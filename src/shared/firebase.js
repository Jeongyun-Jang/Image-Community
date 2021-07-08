import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/database"; //realtime database

const firebaseConfig = {
    apiKey: "AIzaSyD8a7WJPUw6nL0yInSnWCm3lY8y65URWeE",
    authDomain: "image-community-b4c70.firebaseapp.com",
    projectId: "image-community-b4c70",
    storageBucket: "image-community-b4c70.appspot.com",
    messagingSenderId: "613531268002",
    appId: "1:613531268002:web:ca8825987212a3e3ff78fb"
};

firebase.initializeApp(firebaseConfig);

const apiKey = firebaseConfig.apiKey;
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
const realtime = firebase.database();
export{auth, apiKey, firestore, storage, realtime};