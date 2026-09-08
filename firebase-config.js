// ===================================
// CONFIGURATION FIREBASE - ISTA-GC
// ===================================
// 1. Va sur https://console.firebase.google.com
// 2. Crée un projet (ou utilise un projet existant)
// 3. Ajoute une "Web App" (icône </>) dans les paramètres du projet
// 4. Copie les valeurs qu'on te donne et colle-les ci-dessous
// 5. Active Firestore Database (mode "production" ou "test") dans le menu Build > Firestore Database

const firebaseConfig = {
    apiKey: "AIzaSyCv3W6M3RmbipblwJ65Q0uw99a2H3tStU0",
    authDomain: "ista-gc.firebaseapp.com",
    projectId: "ista-gc",
    storageBucket: "ista-gc.firebasestorage.app",
    messagingSenderId: "75501350048",
    appId: "1:75501350048:web:8def71328c58dd6b7d6dc5",
    measurementId: "G-B2Y89V3X35"
};

// Initialisation (SDK "compat" chargé en amont dans le <head> des pages HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Active le cache local (permet de continuer à afficher les dernières données
// connues même en cas de coupure réseau momentanée)
db.enablePersistence().catch((err) => {
    console.warn("Persistance hors-ligne non activée :", err.code);
});

// ---- AUTHENTIFICATION ANONYME ----
// Nécessaire car les règles Firestore exigent "request.auth != null".
// Ça ne remplace pas votre système de rôles (admin/prof/étudiant), qui reste
// géré "à la main" via la collection Firestore "users" comme avant.
// Il faut juste activer "Anonyme" dans Firebase Console > Authentication > Sign-in method.
const authReadyPromise = new Promise((resolve, reject) => {
    auth.onAuthStateChanged((user) => {
        if (user) resolve(user);
    });
    auth.signInAnonymously().catch((err) => {
        console.error("Échec de l'authentification anonyme :", err);
        reject(err);
    });
});
