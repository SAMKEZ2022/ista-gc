// ===================================
// ISTA-GC PLATEFORME - SCRIPT PRINCIPAL
// Version FIREBASE (temps réel) : les étudiants d'une série reçoivent
// automatiquement le lien de la salle dès que leur professeur lance le Live.
// Prérequis : firebase-config.js chargé AVANT ce fichier (variable globale "db").
// ===================================

// ---- SERIES ET SALLES VIRTUELLES FIXES ----
// Chaque série dispose de 3 salles Jitsi permanentes pour les différents niveaux/groupes
// Ça permet à 3 cours différents d'une même série d'être en Live en même temps
const SERIES = {
    gc: {
        nom: "Génie Civil",
        slug: "gc",
        couleur: "#FF6B6B",
        salles: {
            1: "GC - L1/BTS 1 (Salle 1)",
            2: "GC - L2/BTS 2 (Salle 2)",
            3: "GC - L3 (Salle 3)",
            4: "GC - Master 1 (Salle 4)",
            5: "GC - Master 2 (Salle 5)"
        }
    },
    electro: {
        nom: "Électrotechnique",
        slug: "electro",
        couleur: "#4ECDC4",
        salles: {
            1: "Électro - L1/BTS 1 (Salle 1)",
            2: "Électro - L2/BTS 2 (Salle 2)",
            3: "Électro - L3 (Salle 3)",
            4: "Électro - Master 1 (Salle 4)",
            5: "Électro - Master 2 (Salle 5)"
        }
    },
    journalisme: {
        nom: "Journalisme",
        slug: "journalisme",
        couleur: "#45B7D1",
        salles: {
            1: "Journalisme - L1 (Salle 1)",
            2: "Journalisme - L2 (Salle 2)",
            3: "Journalisme - L3 (Salle 3)",
            4: "Journalisme - Master 1 (Salle 4)",
            5: "Journalisme - Master 2 (Salle 5)"
        }
    },
    compta: {
        nom: "Comptabilité Gestion",
        slug: "compta",
        couleur: "#96CEB4",
        salles: {
            1: "Compta - L1 (Salle 1)",
            2: "Compta - L2 (Salle 2)",
            3: "Compta - L3 (Salle 3)",
            4: "Compta - Master 1 (Salle 4)",
            5: "Compta - Master 2 (Salle 5)"
        }
    },
    direction: {
        nom: "Assistante de Direction",
        slug: "direction",
        couleur: "#FFEAA7",
        salles: {
            1: "Direction - L1 (Salle 1)",
            2: "Direction - L2 (Salle 2)",
            3: "Direction - L3 (Salle 3)",
            4: "Direction - Master 1 (Salle 4)",
            5: "Direction - Master 2 (Salle 5)"
        }
    },
    agronomie: {
        nom: "Agronomie",
        slug: "agronomie",
        couleur: "#2ECC71",
        salles: {
            1: "Agronomie - L1/BTS 1 (Salle 1)",
            2: "Agronomie - L2/BTS 2 (Salle 2)",
            3: "Agronomie - L3 (Salle 3)",
            4: "Agronomie - Master 1 (Salle 4)",
            5: "Agronomie - Master 2 (Salle 5)"
        }
    },
    tronc_commun: {
        nom: "Tronc Commun",
        slug: "tronc-commun",
        couleur: "#95A5A6",
        salles: {
            1: "Tronc Commun - L1/BTS 1 (Salle TC1)",
            2: "Tronc Commun - L2/BTS 2 (Salle TC2)",
            3: "Tronc Commun - L3 (Salle TC3)",
            4: "Tronc Commun - Master 1 (Salle TC4)",
            5: "Tronc Commun - Master 2 (Salle TC5)"
        }
    }
};

// ---- NIVEAUX (communs à toutes les séries) ----
// Un étudiant appartient à une série (filière) ET à un niveau (1 à 5).
// Ces niveaux correspondent aux mêmes numéros que les salles des cours
// (c.salle) : ça permet de savoir quels étudiants suivent quel cours.
const NIVEAUX = {
    1: "L1 / BTS 1",
    2: "L2 / BTS 2",
    3: "L3",
    4: "Master 1",
    5: "Master 2"
};

function getNomNiveau(niveau) {
    return NIVEAUX[niveau] || `Niveau ${niveau}`;
}

function getNomSerie(serieId) {
    const serie = SERIES[serieId];
    return serie ? serie.nom : `Série ${serieId}`;
}

function nomSalle(serieId, numeroSalle) {
    const serie = SERIES[serieId];
    if (!serie) return `Salle ${numeroSalle}`;
    return serie.salles[numeroSalle] || `Salle ${numeroSalle}`;
}

function lienSalle(serieId, numeroSalle) {
    return `https://meet.jit.si/ISTA-${serieId}-Salle-${numeroSalle}`;
}

function slugify(texte) {
    return texte
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // enlève les accents
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function estLienJitsi(lien) {
    return typeof lien === 'string' && lien.includes('meet.jit.si/');
}

// ===================================
// ETAT LOCAL EN MEMOIRE
// Rempli automatiquement et en continu par les écouteurs Firestore (onSnapshot).
// Toutes les fonctions d'affichage lisent depuis cet "state" ; il est toujours
// à jour car Firestore pousse chaque changement en temps réel à tous les clients.
// ===================================

let state = {
    COURS: [],
    DEVOIRS: [],
    SUPPORTS: [],
    DEPOTS: [],
    USERS: [],
    PRESENCES: []
};

let etatInitialCoursCharge = false;

// ---- SEED (données de démo au tout premier lancement du projet Firebase) ----

async function seedDonneesInitialesSiNecessaire() {
    const metaRef = db.collection('_meta').doc('init');
    const metaSnap = await metaRef.get();
    if (metaSnap.exists) return; // déjà initialisé, on ne touche à rien

    const batch = db.batch();

    const coursInitiaux = [
        { titre: "Mathématiques Générales", date: "2026-08-25T14:00", serie: "gc", salle: 1, lien: lienSalle("gc", 1), en_live: false },
        { titre: "Physique Bâtiment", date: "2026-08-26T10:00", serie: "gc", salle: 2, lien: lienSalle("gc", 2), en_live: false },
        { titre: "Introduction à l'Électrotechnique", date: "2026-08-27T09:00", serie: "electro", salle: 1, lien: lienSalle("electro", 1), en_live: false },
        { titre: "Fondamentaux du Journalisme", date: "2026-08-27T14:00", serie: "journalisme", salle: 1, lien: lienSalle("journalisme", 1), en_live: false }
    ];
    coursInitiaux.forEach(c => batch.set(db.collection('cours').doc(), c));

    const devoirsInitiaux = [
        { titre: "TD1 - Matrices", desc: "Faire les exos 1 à 5 page 12", serie: "gc" },
        { titre: "TP1 - Béton Armé", desc: "Rendu rapport + photos", serie: "gc" },
        { titre: "Exercice Circuits", desc: "Résoudre les 10 problèmes", serie: "electro" },
        { titre: "Article d'Actualité", desc: "Rédiger un article de 500 mots", serie: "journalisme" }
    ];
    devoirsInitiaux.forEach(d => batch.set(db.collection('devoirs').doc(), d));

    const usersInitiaux = [
        { email: "admin@ista-gc.com", password: "admin123", role: "admin" },
        { email: "prof.math@ista-gc.com", password: "1234", role: "prof", serie: "gc" },
        { email: "prof.electro@ista-gc.com", password: "1234", role: "prof", serie: "electro" },
        { email: "prof.journalisme@ista-gc.com", password: "1234", role: "prof", serie: "journalisme" },
        { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant", serie: "gc", niveau: 1 },
        { email: "etudiant.electro@ista-gc.com", password: "1234", role: "etudiant", serie: "electro", niveau: 1 }
    ];
    usersInitiaux.forEach(u => batch.set(db.collection('users').doc(), u));

    batch.set(metaRef, { seeded: true, date: new Date().toISOString() });

    await batch.commit();
}

// ---- ECOUTE TEMPS REEL ----
// C'est le cœur du système : dès qu'un document "cours" change dans Firestore
// (ex: un prof passe en_live à true), Firestore notifie INSTANTANÉMENT tous les
// navigateurs connectés (prof, étudiants, admin) sans qu'ils aient à recharger.

function demarrerEcouteTempsReel() {
    db.collection('cours').onSnapshot((snap) => {
        const ancienCours = state.COURS;
        state.COURS = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (etatInitialCoursCharge) {
            notifierNouveauxLivePourEtudiant(ancienCours, state.COURS);
        }
        etatInitialCoursCharge = true;

        rafraichirVuesLieesAuxCours();
    }, (err) => console.error("Erreur d'écoute Firestore (cours) :", err));

    db.collection('devoirs').onSnapshot((snap) => {
        state.DEVOIRS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        rafraichirVuesLieesAuxDevoirs();
    }, (err) => console.error("Erreur d'écoute Firestore (devoirs) :", err));

    db.collection('supports').onSnapshot((snap) => {
        state.SUPPORTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        afficherSupportsProf();
        afficherSupportsEtudiant();
    }, (err) => console.error("Erreur d'écoute Firestore (supports) :", err));

    db.collection('depots').onSnapshot((snap) => {
        state.DEPOTS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        afficherDepotsProf();
        afficherDevoirsEtudiant();
    }, (err) => console.error("Erreur d'écoute Firestore (depots) :", err));

    db.collection('users').onSnapshot((snap) => {
        state.USERS = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        afficherUsers();
        afficherStats();
        afficherClasseEtudiant();
        afficherCoursProf();
    }, (err) => console.error("Erreur d'écoute Firestore (users) :", err));

    // Temps de présence des étudiants dans les cours (pour le minuteur et le
    // suivi par l'enseignant). Voir "SUIVI DE PRESENCE" plus bas.
    db.collection('presences').onSnapshot((snap) => {
        state.PRESENCES = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        afficherClasseEtudiant();
        afficherCoursProf();
    }, (err) => console.error("Erreur d'écoute Firestore (presences) :", err));
}

function rafraichirVuesLieesAuxCours() {
    afficherCoursProf();
    afficherCoursEtudiant();
    afficherProchainsCours();
    afficherCoursAdmin();
    afficherStats();
    synchroniserPresenceEtudiant();
}

function rafraichirVuesLieesAuxDevoirs() {
    afficherDevoirsAdmin();
    afficherDevoirsEtudiant();
    afficherStats();
    remplirSelectDevoir('depotDevoir');
}

// ---- SESSION (reste locale au navigateur, c'est normal : c'est juste "qui est connecté ici") ----

function getCurrentUser() {
    try {
        const raw = localStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error('Session corrompue, déconnexion.', err);
        localStorage.removeItem('currentUser');
        return null;
    }
}

const currentUser = getCurrentUser();

(function guardPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const hasLoginForm = !!document.getElementById('loginForm');

    if (!currentUser && !hasLoginForm) {
        window.location.href = 'index.html';
        return;
    }
    if (currentUser) {
        const expectedPage = `${currentUser.role}.html`;
        if (currentPage !== expectedPage) {
            window.location.href = expectedPage;
        }
    }
})();

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// ===================================
// NOTIFICATIONS LIVE (étudiant)
// Ne notifie QUE les étudiants de la série concernée par le cours lancé.
// ===================================

function jouerSonAlerte() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    } catch (err) {
        console.warn("Son d'alerte indisponible :", err);
    }
}

function demanderPermissionNotification() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function envoyerNotificationLive(cours) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notif = new Notification('🔴 Cours en Live !', {
            body: `${cours.titre} vient de démarrer dans ${nomSalle(cours.serie, cours.salle)}. Rejoignez maintenant.`
        });
        notif.onclick = () => {
            window.focus();
            const cible = document.getElementById(`live-cours-${cours.id}`);
            if (cible) cible.scrollIntoView({ behavior: 'smooth' });
        };
    }
}

// Ne concerne QUE les étudiants (une page avec #listeCours) et QUE leur propre série
function notifierNouveauxLivePourEtudiant(ancienCours, nouveauCours) {
    if (!currentUser || currentUser.role !== 'etudiant') return;
    if (!document.getElementById('listeCours')) return;

    const ancienIdsLive = new Set(ancienCours.filter(c => c.en_live).map(c => c.id));
    const nouveauxLiveConcernes = nouveauCours.filter(c =>
        c.en_live && c.serie === currentUser.serie && !ancienIdsLive.has(c.id)
    );

    nouveauxLiveConcernes.forEach(c => {
        jouerSonAlerte();
        envoyerNotificationLive(c);
    });
}

// ===================================
// SUIVI DE PRESENCE (minuteur par étudiant)
// Pendant qu'un cours de sa série est en Live, le navigateur de l'étudiant
// enregistre régulièrement le temps écoulé dans Firestore (collection
// "presences"). Ça permet :
//  - au professeur de voir combien de minutes chaque étudiant a passé
//    dans SON cours (afficherCoursProf) ;
//  - aux camarades de classe de voir un minuteur en direct à côté de
//    chaque nom (afficherClasseEtudiant).
// ===================================

// coursId -> { debut: Date, dernierFlush: Date }  (uniquement en mémoire locale)
let presencesEnCours = {};

function idPresence(coursId, email) {
    return `${coursId}_${slugify(email)}`;
}

async function majPresenceFirestore(coursId, enLigne, minutesAAjouter) {
    if (!currentUser) return;
    const ref = db.collection('presences').doc(idPresence(coursId, currentUser.email));
    try {
        await ref.set({
            coursId,
            etudiant: currentUser.email,
            serie: currentUser.serie,
            niveau: currentUser.niveau || null,
            enLigne,
            sessionDebut: enLigne ? new Date().toISOString() : null,
            minutesTotal: firebase.firestore.FieldValue.increment(minutesAAjouter || 0)
        }, { merge: true });
    } catch (err) {
        console.error("Erreur d'enregistrement de la présence :", err);
    }
}

// Enregistre le temps écoulé depuis le dernier "flush" dans Firestore.
// resterEnLigne=false quand le cours n'est plus en Live ou que la page se ferme.
function flushPresence(coursId, resterEnLigne) {
    const session = presencesEnCours[coursId];
    if (!session) return;
    const maintenant = new Date();
    const minutesEcoulees = (maintenant - session.dernierFlush) / 60000;
    session.dernierFlush = maintenant;
    majPresenceFirestore(coursId, resterEnLigne, minutesEcoulees);
}

// Appelée à chaque changement de la liste des cours : démarre/arrête le
// suivi selon les cours actuellement en Live pour la série de l'étudiant.
function synchroniserPresenceEtudiant() {
    if (!currentUser || currentUser.role !== 'etudiant') return;
    if (!document.getElementById('listeCours')) return; // page étudiant uniquement

    const coursLiveConcernes = state.COURS.filter(c => c.en_live && c.serie === currentUser.serie);
    const idsLive = new Set(coursLiveConcernes.map(c => c.id));

    coursLiveConcernes.forEach(c => {
        if (!presencesEnCours[c.id]) {
            const maintenant = new Date();
            presencesEnCours[c.id] = { debut: maintenant, dernierFlush: maintenant };
            majPresenceFirestore(c.id, true, 0); // crée/réactive le document de présence
        }
    });

    Object.keys(presencesEnCours).forEach(coursId => {
        if (!idsLive.has(coursId)) {
            flushPresence(coursId, false);
            delete presencesEnCours[coursId];
        }
    });
}

// Sauvegarde périodique (toutes les 30s) pour que profs/camarades voient
// un temps à jour même si l'étudiant reste connecté longtemps.
setInterval(() => {
    Object.keys(presencesEnCours).forEach(coursId => flushPresence(coursId, true));
}, 30000);

// Meilleure tentative de sauvegarde à la fermeture de la page/onglet.
window.addEventListener('beforeunload', () => {
    Object.keys(presencesEnCours).forEach(coursId => flushPresence(coursId, false));
});

// Rafraîchissement visuel du minuteur toutes les secondes (les données
// Firestore, elles, ne changent que toutes les 30s ou moins).
setInterval(() => {
    afficherClasseEtudiant();
    afficherCoursProf();
}, 1000);

// Calcule le temps total (en secondes) représenté par un document de présence,
// en ajoutant le temps de la session en cours si l'étudiant est actuellement en ligne.
function calculerSecondesPresence(p) {
    let secondes = (p.minutesTotal || 0) * 60;
    if (p.enLigne && p.sessionDebut) {
        secondes += (Date.now() - new Date(p.sessionDebut).getTime()) / 1000;
    }
    return Math.max(0, Math.round(secondes));
}

// Formate un nombre de secondes en "1h 05min" ou "05:23" (façon minuteur).
function formatDuree(secondesTotales) {
    const s = Math.floor(secondesTotales);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('.btn-logout').forEach(btn => btn.addEventListener('click', logout));

    // Attend que l'authentification anonyme Firebase soit prête avant de
    // toucher Firestore (les règles exigent request.auth != null).
    try {
        await authReadyPromise;
    } catch (err) {
        console.error(err);
        alert("⚠️ Impossible de se connecter au serveur. Vérifiez votre connexion internet et rechargez la page.");
        return;
    }

    // ---------------- LOGIN ----------------
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const errorEl = document.getElementById('error');
            const submitBtn = loginForm.querySelector('button[type="submit"]');

            const emailValue = emailInput.value.trim().toLowerCase();
            const passwordValue = passwordInput.value;

            errorEl.innerText = '';
            if (submitBtn) submitBtn.disabled = true;

            try {
                await seedDonneesInitialesSiNecessaire();

                const snap = await db.collection('users').where('email', '==', emailValue).limit(1).get();

                if (snap.empty || snap.docs[0].data().password !== passwordValue) {
                    errorEl.innerText = '❌ Email ou mot de passe incorrect';
                    return;
                }

                const userDoc = snap.docs[0];
                const { password, ...safeUser } = userDoc.data();
                safeUser.id = userDoc.id;
                localStorage.setItem('currentUser', JSON.stringify(safeUser));
                window.location.href = safeUser.role + '.html';
            } catch (err) {
                console.error('Erreur de connexion :', err);
                errorEl.innerText = "⚠️ Connexion impossible. Vérifiez votre connexion internet et réessayez.";
            } finally {
                if (submitBtn) submitBtn.disabled = false;
            }
        });
        return; // pas besoin d'écoute temps réel sur la page de login
    }

    // À partir d'ici, l'utilisateur est connecté : on démarre l'écoute temps réel
    demarrerEcouteTempsReel();

    // ---------------- ADMIN ----------------
    if (document.getElementById('listeUsers')) {
        const formAddUser = document.getElementById('formAddUser');
        formAddUser.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newEmail = document.getElementById('newEmail');
            const newPassword = document.getElementById('newPassword');
            const newRole = document.getElementById('newRole');
            const newSerie = document.getElementById('newSerie');
            const newNiveau = document.getElementById('newNiveau');

            const email = newEmail.value.trim().toLowerCase();
            if (!email || !newPassword.value || !newRole.value) {
                alert("Veuillez remplir tous les champs.");
                return;
            }

            if (state.USERS.some(u => u.email.toLowerCase() === email)) {
                alert("Un utilisateur avec cet email existe déjà.");
                return;
            }

            if (newRole.value !== 'admin' && !newSerie.value) {
                alert("Veuillez choisir une série pour ce professeur/étudiant (sinon il ne verra jamais aucun cours).");
                return;
            }

            if (newRole.value === 'etudiant' && !newNiveau.value) {
                alert("Veuillez choisir le niveau de cet étudiant (sinon il ne verra jamais la liste de sa classe).");
                return;
            }

            const newUser = { email, password: newPassword.value, role: newRole.value };
            if (newRole.value !== 'admin' && newSerie.value) {
                newUser.serie = newSerie.value;
            }
            if (newRole.value === 'etudiant' && newNiveau.value) {
                newUser.niveau = parseInt(newNiveau.value, 10);
            }

            try {
                await db.collection('users').add(newUser);
                e.target.reset();
            } catch (err) {
                console.error(err);
                alert("⚠️ Impossible de créer l'utilisateur.");
            }
        });

        const formAddCours = document.getElementById('formAddCours');
        formAddCours.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newTitre = document.getElementById('newTitre');
            const newDate = document.getElementById('newDate');
            const newSerie = document.getElementById('newSerieCours');
            const newSalle = document.getElementById('newSalle');

            if (!newTitre.value || !newDate.value || !newSerie.value) {
                alert("Le titre, la date et la série du cours sont obligatoires.");
                return;
            }

            const serieId = newSerie.value;
            const numeroSalle = parseInt(newSalle.value, 10);

            try {
                await db.collection('cours').add({
                    titre: newTitre.value,
                    date: newDate.value,
                    serie: serieId,
                    salle: numeroSalle,
                    lien: lienSalle(serieId, numeroSalle),
                    en_live: false
                });
                e.target.reset();
            } catch (err) {
                console.error(err);
                alert("⚠️ Impossible de programmer le cours.");
            }
        });

        const formAddDevoir = document.getElementById('formAddDevoir');
        formAddDevoir.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newTitreDevoir = document.getElementById('newTitreDevoir');
            const newDescDevoir = document.getElementById('newDescDevoir');
            const newSerieDevoir = document.getElementById('newSerieDevoir');

            if (!newTitreDevoir.value || !newSerieDevoir.value) {
                alert("Le titre et la série du devoir sont obligatoires.");
                return;
            }

            try {
                await db.collection('devoirs').add({
                    titre: newTitreDevoir.value,
                    desc: newDescDevoir.value,
                    serie: newSerieDevoir.value
                });
                e.target.reset();
            } catch (err) {
                console.error(err);
                alert("⚠️ Impossible d'ajouter le devoir.");
            }
        });
    }

    // ---------------- PROF ----------------
    if (document.getElementById('listeCoursProf')) {
        remplirSelectCours('supportCours');

        const formAddSupport = document.getElementById('formAddSupport');
        formAddSupport.addEventListener('submit', (e) => {
            e.preventDefault();
            const supportCours = document.getElementById('supportCours');
            const supportNom = document.getElementById('supportNom');
            const supportFile = document.getElementById('supportFile');

            if (!supportCours.value) {
                alert("Veuillez choisir un cours.");
                return;
            }
            const file = supportFile.files[0];
            if (!file) {
                alert("Veuillez choisir un fichier.");
                return;
            }
            if (file.size > 700 * 1024) {
                if (!confirm("Ce fichier est volumineux (>700 Ko) et pourrait dépasser la limite de taille d'un document Firestore (1 Mo). Continuer quand même ?")) {
                    return;
                }
            }

            const reader = new FileReader();
            reader.onerror = () => alert("Erreur de lecture du fichier.");
            reader.onload = async () => {
                try {
                    await db.collection('supports').add({
                        coursId: supportCours.value,
                        nom: supportNom.value,
                        fichier: reader.result
                    });
                    e.target.reset();
                } catch (err) {
                    console.error(err);
                    alert("⚠️ Impossible d'envoyer le support (fichier probablement trop volumineux).");
                }
            };
            reader.readAsDataURL(file);
        });
    }

    // ---------------- ETUDIANT ----------------
    if (document.getElementById('listeCours')) {
        demanderPermissionNotification();
        remplirSelectDevoir('depotDevoir');

        const formDepot = document.getElementById('formDepot');
        formDepot.addEventListener('submit', (e) => {
            e.preventDefault();
            const depotDevoir = document.getElementById('depotDevoir');
            const depotFile = document.getElementById('depotFile');

            if (!depotDevoir.value) {
                alert("Veuillez choisir un devoir.");
                return;
            }
            const file = depotFile.files[0];
            if (!file) {
                alert("Veuillez choisir un fichier.");
                return;
            }
            if (file.size > 700 * 1024) {
                if (!confirm("Ce fichier est volumineux (>700 Ko) et pourrait dépasser la limite de taille d'un document Firestore (1 Mo). Continuer quand même ?")) {
                    return;
                }
            }

            const reader = new FileReader();
            reader.onerror = () => alert("Erreur de lecture du fichier.");
            reader.onload = async () => {
                const devoirId = depotDevoir.value;
                const dejaDepose = state.DEPOTS.some(d => d.devoirId === devoirId && d.etudiant === currentUser.email);
                if (dejaDepose) {
                    alert("Vous avez déjà déposé une copie pour ce devoir.");
                    return;
                }

                try {
                    await db.collection('depots').add({
                        devoirId,
                        etudiant: currentUser.email,
                        fichier: reader.result,
                        note: ""
                    });
                    e.target.reset();
                    alert("✅ Copie déposée !");
                } catch (err) {
                    console.error(err);
                    alert("⚠️ Impossible d'envoyer la copie (fichier probablement trop volumineux).");
                }
            };
            reader.readAsDataURL(file);
        });
    }
});

// ================= FONCTIONS D'AFFICHAGE / ADMIN =================

function afficherUsers() {
    const el = document.getElementById('listeUsers');
    if (!el) return;
    el.innerHTML = state.USERS.map((u) =>
        `<div class="card"><p><b>${u.email}</b> - ${u.role} ${u.serie ? '(' + getNomSerie(u.serie) + (u.niveau ? ' - ' + getNomNiveau(u.niveau) : '') + ')' : ''}</p>${u.role !== 'admin' ? `<button onclick="supprimerUser('${u.id}')" class="btn-danger">Supprimer</button>` : ''}</div>`
    ).join('') || '<p>Aucun utilisateur</p>';
}

async function supprimerUser(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    try {
        await db.collection('users').doc(id).delete();
    } catch (err) {
        console.error(err);
        alert("⚠️ Suppression impossible.");
    }
}

function afficherCoursAdmin() {
    const el = document.getElementById('listeCoursAdmin');
    if (!el) return;
    el.innerHTML = state.COURS.map((c) =>
        `<div class="card"><h4>${c.titre}</h4><p>📚 ${getNomSerie(c.serie)} | 📅 ${new Date(c.date).toLocaleString('fr-FR')} | 🏫 ${nomSalle(c.serie, c.salle)} ${c.en_live ? '🔴 LIVE' : ''}</p><button onclick="supprimerCours('${c.id}')" class="btn-danger">Supprimer</button></div>`
    ).join('') || '<p>Aucun cours</p>';
}

async function supprimerCours(id) {
    if (!confirm("Supprimer ce cours ? Cette action est irréversible.")) return;
    try {
        await db.collection('cours').doc(id).delete();
    } catch (err) {
        console.error(err);
        alert("⚠️ Suppression impossible.");
    }
}

function afficherDevoirsAdmin() {
    const el = document.getElementById('listeDevoirsAdmin');
    if (!el) return;
    el.innerHTML = state.DEVOIRS.map((d) =>
        `<div class="card"><h4>${d.titre}</h4><p>📚 ${getNomSerie(d.serie)}</p><p>${d.desc}</p><button onclick="supprimerDevoir('${d.id}')" class="btn-danger">Supprimer</button></div>`
    ).join('') || '<p>Aucun devoir</p>';
}

async function supprimerDevoir(id) {
    if (!confirm("Supprimer ce devoir ? Les dépôts associés resteront orphelins.")) return;
    try {
        await db.collection('devoirs').doc(id).delete();
    } catch (err) {
        console.error(err);
        alert("⚠️ Suppression impossible.");
    }
}

function afficherStats() {
    if (!document.getElementById('totalCours')) return;
    document.getElementById('totalCours').innerText = state.COURS.length;
    document.getElementById('totalDevoirs').innerText = state.DEVOIRS.length;
    document.getElementById('totalProfs').innerText = state.USERS.filter(u => u.role === 'prof').length;
    document.getElementById('totalEtudiants').innerText = state.USERS.filter(u => u.role === 'etudiant').length;
}

// ================= FONCTIONS PROF =================

async function lancerCours(id) {
    const cours = state.COURS.find(c => c.id === id);
    if (!cours) return;

    const conflit = state.COURS.find(c => c.id !== id && c.serie === cours.serie && c.salle === cours.salle && c.en_live === true);
    if (conflit) {
        alert(`⚠️ Impossible : la salle "${nomSalle(cours.serie, cours.salle)}" est déjà occupée par le cours "${conflit.titre}". Coupez-le d'abord, ou choisissez un cours dans une autre salle.`);
        return;
    }

    try {
        await db.collection('cours').doc(id).update({ en_live: true });
        // Pas besoin de rafraîchir manuellement : Firestore pousse le changement
        // à ce navigateur ET à tous les étudiants concernés en temps réel.
        alert("🔴 Le cours est LANCÉ ! Les étudiants de la série reçoivent le lien instantanément.");
    } catch (err) {
        console.error(err);
        alert("⚠️ Impossible de lancer le cours. Vérifiez votre connexion.");
    }
}

async function couperCours(id) {
    try {
        await db.collection('cours').doc(id).update({ en_live: false });
        alert("⚫ Le cours est TERMINÉ");
    } catch (err) {
        console.error(err);
        alert("⚠️ Impossible de couper le cours.");
    }
}

function blocVisio(c) {
    // NOTE : meet.jit.si (serveur public gratuit) limite les réunions à 5 minutes
    // lorsqu'elles sont intégrées en <iframe> dans une page ("embed mode").
    // Cette limite ne s'applique PAS quand la réunion est ouverte dans un onglet
    // séparé — on utilise donc systématiquement un bouton "Rejoindre" plutôt
    // qu'un <iframe>, pour des cours sans limite de durée.
    return `<div class="jitsi-fallback"><p>🎥 Salle de visioconférence prête.</p><a href="${c.lien}" target="_blank" rel="noopener"><button class="btn-live">▶️ Rejoindre la visio</button></a></div>`;
}

// Liste, pour un cours donné, le temps passé par chaque étudiant concerné
// (même série + même niveau que la salle du cours) — visible par le prof.
function blocPresenceEtudiants(c) {
    const etudiantsConcernes = state.USERS.filter(u =>
        u.role === 'etudiant' && u.serie === c.serie && Number(u.niveau) === Number(c.salle)
    );
    if (etudiantsConcernes.length === 0) return '';

    const lignes = etudiantsConcernes.map(u => {
        const presencesEtudiant = state.PRESENCES.filter(p => p.etudiant === u.email && p.coursId === c.id);
        const secondes = presencesEtudiant.reduce((total, p) => total + calculerSecondesPresence(p), 0);
        const enDirect = presencesEtudiant.some(p => p.enLigne);
        return `<li>${enDirect ? '🔴' : '⏱️'} ${u.email} — <b>${formatDuree(secondes)}</b></li>`;
    }).join('');

    return `<div class="presence-etudiants"><p><b>⏱️ Temps passé par les étudiants dans ce cours :</b></p><ul>${lignes}</ul></div>`;
}

function afficherCoursProf() {
    const el = document.getElementById('listeCoursProf');
    if (!el || !currentUser) return;

    // Un prof ne gère que les cours de sa propre série
    const mesCours = currentUser.role === 'admin'
        ? state.COURS
        : state.COURS.filter(c => c.serie === currentUser.serie);

    el.innerHTML = mesCours.map(c =>
        `<div class="card"><h4>${c.titre}</h4><p>📚 ${getNomSerie(c.serie)} | 📅 ${new Date(c.date).toLocaleString('fr-FR')} | 🏫 ${nomSalle(c.serie, c.salle)}</p>${c.en_live ? `<p class="live">🔴 EN LIVE</p>${blocVisio(c)}<button onclick="couperCours('${c.id}')" class="btn-danger" style="margin-top:12px;">Couper le Live</button>` : `<button onclick="lancerCours('${c.id}')" class="btn-success">▶️ Lancer le Live</button>`}${blocPresenceEtudiants(c)}</div>`
    ).join('') || "<p>Aucun cours programmé</p>";
}

function afficherSupportsProf() {
    const el = document.getElementById('listeSupportsProf');
    if (!el) return;
    el.innerHTML = state.SUPPORTS.map(s => {
        const cours = state.COURS.find(c => c.id === s.coursId);
        return `<div class="card"><h4>${s.nom}</h4><p><b>Cours:</b> ${cours ? cours.titre : '(cours supprimé)'}</p><a href="${s.fichier}" download="${s.nom}" class="btn-secondary">Télécharger</a><button onclick="supprimerSupport('${s.id}')" class="btn-danger">Supprimer</button></div>`;
    }).join('') || "<p>Aucun support</p>";
}

async function supprimerSupport(id) {
    if (!confirm("Supprimer ce support ?")) return;
    try {
        await db.collection('supports').doc(id).delete();
    } catch (err) {
        console.error(err);
        alert("⚠️ Suppression impossible.");
    }
}

function afficherDepotsProf() {
    const el = document.getElementById('listeDepotsProf');
    if (!el) return;
    el.innerHTML = state.DEPOTS.map(d => {
        const devoir = state.DEVOIRS.find(dv => dv.id === d.devoirId);
        return `<div class="card"><h4>${devoir ? devoir.titre : '(devoir supprimé)'}</h4><p><b>Étudiant:</b> ${d.etudiant}</p><a href="${d.fichier}" download="copie.pdf" class="btn-secondary">Télécharger Copie</a><input type="number" min="0" max="20" placeholder="Note /20" value="${d.note}" onchange="noterCopie('${d.id}', this.value)" style="width:100px;"></div>`;
    }).join('') || "<p>Aucune copie</p>";
}

async function noterCopie(id, note) {
    const n = parseFloat(note);
    if (note !== "" && (isNaN(n) || n < 0 || n > 20)) {
        alert("La note doit être comprise entre 0 et 20.");
        afficherDepotsProf();
        return;
    }
    try {
        await db.collection('depots').doc(id).update({ note });
    } catch (err) {
        console.error(err);
        alert("⚠️ Impossible d'enregistrer la note.");
    }
}

// ================= FONCTIONS ETUDIANT =================

function afficherBanniereLive(coursLive) {
    const banniere = document.getElementById('liveBanner');
    if (!banniere) return;

    if (coursLive.length === 0) {
        banniere.innerHTML = '';
        return;
    }

    banniere.innerHTML = coursLive.map(c =>
        `<span>🔴 ${c.titre} (${nomSalle(c.serie, c.salle)}) est en Live</span><a href="#live-cours-${c.id}">▶️ Voir le cours</a>`
    ).join(' &nbsp;|&nbsp; ');
    banniere.className = 'live-banner';
}

function afficherCoursEtudiant() {
    const el = document.getElementById('listeCours');
    if (!el || !currentUser) return;

    // Seuls les cours en live DE SA PROPRE SERIE sont montrés = "les étudiants concernés"
    const coursLive = state.COURS.filter(c => c.en_live === true && c.serie === currentUser.serie);

    afficherBanniereLive(coursLive);

    el.innerHTML = coursLive.map(c =>
        `<div class="card card-live" id="live-cours-${c.id}"><h4>🔴 ${c.titre}</h4><p>📚 ${getNomSerie(c.serie)} | 📅 ${new Date(c.date).toLocaleString('fr-FR')} | 🏫 ${nomSalle(c.serie, c.salle)}</p>${blocVisio(c)}</div>`
    ).join('') || "<p>Aucun cours en live pour le moment. Cette page se met à jour automatiquement et instantanément dès qu'un professeur démarre un cours.</p>";
}

function afficherProchainsCours() {
    const el = document.getElementById('listeProchainsCours');
    if (!el || !currentUser) return;

    const prochains = state.COURS
        .filter(c => c.en_live === false && c.serie === currentUser.serie)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    el.innerHTML = prochains.map(c =>
        `<div class="card"><h4>${c.titre}</h4><p>📚 ${getNomSerie(c.serie)} | 📅 ${new Date(c.date).toLocaleString('fr-FR')} | 🏫 ${nomSalle(c.serie, c.salle)}</p></div>`
    ).join('') || "<p>Aucun cours programmé pour le moment</p>";
}

function afficherSupportsEtudiant() {
    const el = document.getElementById('listeSupportsEtudiant');
    if (!el || !currentUser) return;
    el.innerHTML = state.SUPPORTS
        .filter(s => {
            const cours = state.COURS.find(c => c.id === s.coursId);
            return cours && cours.serie === currentUser.serie;
        })
        .map(s => {
            const cours = state.COURS.find(c => c.id === s.coursId);
            return `<div class="card"><h4>${s.nom}</h4><p><b>Cours:</b> ${cours ? cours.titre : '(cours supprimé)'}</p><a href="${s.fichier}" download="${s.nom}" class="btn-success">📥 Télécharger</a></div>`;
        }).join('') || "<p>Aucun support pour le moment</p>";
}

// Liste des camarades de classe : uniquement ceux de la même série ET du
// même niveau que l'étudiant connecté ("seuls les étudiants du même niveau
// peuvent consulter leur liste").
function afficherClasseEtudiant() {
    const el = document.getElementById('listeClasseEtudiant');
    if (!el || !currentUser) return;

    if (!currentUser.niveau) {
        el.innerHTML = "<p>⚠️ Votre niveau n'a pas encore été renseigné par l'administration. Demandez à l'administrateur de le compléter pour voir la liste de votre classe.</p>";
        return;
    }

    const camarades = state.USERS.filter(u =>
        u.role === 'etudiant' && u.serie === currentUser.serie && Number(u.niveau) === Number(currentUser.niveau)
    );

    el.innerHTML = camarades.map(u => {
        const presenceEnDirect = state.PRESENCES.find(p => p.etudiant === u.email && p.serie === currentUser.serie && p.enLigne);
        const secondes = presenceEnDirect
            ? calculerSecondesPresence(presenceEnDirect)
            : state.PRESENCES.filter(p => p.etudiant === u.email && p.serie === currentUser.serie)
                .reduce((total, p) => total + calculerSecondesPresence(p), 0);

        return `<div class="card classe-item">
            <span class="minuteur ${presenceEnDirect ? 'minuteur-actif' : ''}">${presenceEnDirect ? '🔴' : '⏱️'} ${formatDuree(secondes)}</span>
            <span>${u.email === currentUser.email ? `👤 ${u.email} (vous)` : `🎓 ${u.email}`}</span>
        </div>`;
    }).join('') || "<p>Vous êtes seul(e) dans ce niveau pour le moment.</p>";
}

function afficherDevoirsEtudiant() {
    const el = document.getElementById('listeDevoirsEtudiant');
    if (!el || !currentUser) return;
    el.innerHTML = state.DEVOIRS
        .filter(d => d.serie === currentUser.serie)
        .map(d => {
            const monDepot = state.DEPOTS.find(dep => dep.devoirId === d.id && dep.etudiant === currentUser.email);
            return `<div class="card"><h4>${d.titre}</h4><p>${d.desc}</p>${monDepot ? `<p class="success">✅ Déposé. Note: ${monDepot.note || 'En attente'}</p>` : `<p class="warning">❌ Pas encore déposé</p>`}</div>`;
        }).join('') || "<p>Aucun devoir</p>";
}

function remplirSelectCours(id) {
    const el = document.getElementById(id);
    if (!el || !currentUser) return;
    const cours = currentUser.role === 'admin' ? state.COURS : state.COURS.filter(c => c.serie === currentUser.serie);
    el.innerHTML = '<option value="">Choisir un cours</option>' +
        cours.map(c => `<option value="${c.id}">${c.titre} (${getNomSerie(c.serie)})</option>`).join('');
}

function remplirSelectDevoir(id) {
    const el = document.getElementById(id);
    if (!el || !currentUser) return;
    const devoirs = currentUser.role === 'admin' ? state.DEVOIRS : state.DEVOIRS.filter(d => d.serie === currentUser.serie);
    el.innerHTML = '<option value="">Choisir un devoir</option>' +
        devoirs.map(d => `<option value="${d.id}">${d.titre} (${getNomSerie(d.serie)})</option>`).join('');
}

function remplirSelectSeries(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="">Choisir une série</option>' +
        Object.keys(SERIES).map(key => `<option value="${key}">${SERIES[key].nom}</option>`).join('');
}

function remplirSelectNiveaux(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = '<option value="">-- Choisir un niveau --</option>' +
        Object.keys(NIVEAUX).map(num => `<option value="${num}">${NIVEAUX[num]}</option>`).join('');
}

function remplirSelectSalles(id, serieId) {
    const el = document.getElementById(id);
    if (!el || !serieId) return;
    const serie = SERIES[serieId];
    if (!serie) return;
    el.innerHTML = Object.keys(serie.salles).map(num =>
        `<option value="${num}">${serie.salles[num]}</option>`
    ).join('');
}
