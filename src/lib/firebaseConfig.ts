// Safe fallback configuration generated to prevent build failures when exported to a ZIP or GitHub.
// This file is tracked by Git and included in your download, unlike the ignored dynamic configuration.

let config = {
  projectId: "fundamental-quartet-v8gvj",
  appId: "1:312684437736:web:aeceeea44dc0d18cbd695d",
  apiKey: "AIzaSyAlB92sPTWJhk0qszk3fVTEzgywxUcsJ1g",
  authDomain: "fundamental-quartet-v8gvj.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-04857d33-5387-48f6-acd6-e428ad7ad02f",
  storageBucket: "fundamental-quartet-v8gvj.firebasestorage.app",
  messagingSenderId: "312684437736",
  measurementId: ""
};

// If you deploy this app on a free platform (Vercel, Netlify, GitHub Pages, etc.)
// and want to use your own Firebase project, simply define these environment variables:
if (import.meta.env.VITE_FIREBASE_API_KEY) {
  config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
  };
}

export default config;
