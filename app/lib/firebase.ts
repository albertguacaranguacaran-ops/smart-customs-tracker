// Firebase Configuration for Textile Control Tower
// Created: 2026-01-28

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyD77obuFEOqYLCIBOQZXc9sbafUcUfynLE",
    authDomain: "textile-control-tower.firebaseapp.com",
    projectId: "textile-control-tower",
    storageBucket: "textile-control-tower.firebasestorage.app",
    messagingSenderId: "102701231339",
    appId: "1:102701231339:web:38c0c6590bc293Bad827ae",
    measurementId: "G-BJQ7QY0GVE"
};

// Initialize Firebase (prevent duplicate initialization in dev mode)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
