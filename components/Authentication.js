import { initializeApp } from "firebase/app";
import {
    initializeAuth,
    getReactNativePersistence,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase-konfiguraatio
const firebaseConfig = {
    apiKey: "AIzaSyD2j0higiMMFNHmEPWZ7C3bvB4cVsg3wwY",
    authDomain: "arviointikirja.firebaseapp.com",
    databaseURL: "https://arviointikirja-default-rtdb.firebaseio.com",
    projectId: "arviointikirja",
    storageBucket: "arviointikirja.appspot.com",
    messagingSenderId: "729654841858",
    appId: "1:729654841858:web:f0f7f01fbc2a09d16e4d1b",
};

// Alusta Firebase
export const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// Rekisteröinti
export const handleSignUp = async (uusiemail, uusipassword) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, uusiemail, uusipassword);
        console.log("User registered:", userCredential.user);
        return userCredential; // Palautetaan käyttäjän tiedot
    } catch (error) {
        console.error("Sign up error:", error.message);
        throw error;
    }
};

// Kirjautuminen
export const handleSignIn = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User signed in:", userCredential.user);
        return userCredential;
    } catch (error) {
        console.error("Login failed:", error.message);
        throw error;
    }
};

// Uloskirjautuminen
export const handleLogout = async () => {
    try {
        await signOut(auth);
        console.log("User signed out");
    } catch (error) {
        console.error("Logout failed:", error.message);
    }
};

