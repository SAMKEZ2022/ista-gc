// ===================================
// ISTA-GC PLATEFORME V13.1 - CORRIGÉE
// ===================================
const LIEN_MEET_PERMANENT = 'https://meet.google.com/yyb-hgqr-crq';

// ⚠️ ATTENTION (non corrigé ici, nécessite une vraie architecture) :
// Tous les cours "live" partagent CE MÊME lien Meet. Si deux profs
// lancent un live en même temps, leurs élèves respectifs se retrouveront
// dans la même visioconférence. Envisager un lien par cours si plusieurs
// profs peuvent être en live simultanément.

// 1. BASE DE DONNEES
const db = {
    users: [
        { id: 1, email: 'admin@ista-gc.com', password: 'admin123', role: 'admin', nom: 'Admin ISTA' },
        { id: 2, email: 'prof.math@ista-gc.com', password: '1234', role: 'prof', nom: 'Prof. Koffi' },
        { id: 3, email: 'etudiant.gc@ista-gc.com', password: '1234', role: 'etudiant', nom: 'Etudiant GC' }
    ],
    cours: [],      // {id, titre, date, profId, lienMeet, isLive}
    supports: [],   // {id, coursId, titre, lien}
    devoirs: [],    // {id, coursId, titre, dateLimite}
    depots: []      // {id, devoirId, etudiantId, nomFichier}
};

const saveDB = () => localStorage.setItem('ista_gc_db_v13', JSON.stringify(db));

// FIX: try/catch pour éviter un crash total si le JSON stocké est corrompu
const loadDB = () => {
    try {
        const data = localStorage.getItem('ista_gc_db_v13');
        if (data) Object.assign(db, JSON.parse(data));
    } catch (err) {
        console.error('Erreur de lecture de la base locale, réinitialisation.', err);
        localStorage.removeItem('ista_gc_db_v13');
    }
};
loadDB();

// FIX: lecture sécurisée de l'utilisateur en session (try/catch)
const getCurrentUser = () => {
    try {
        const raw = sessionStorage.getItem('currentUser_v13');
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.error('Session corrompue, déconnexion.', err);
        sessionStorage.removeItem('currentUser_v13');
        return null;
    }
};

// 2. LOGIN
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        // FIX: on récupère les champs explicitement au lieu de compter
        // sur les variables globales implicites créées par les id="..."
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const errorEl = document.getElementById('error');

        // FIX: email insensible à la casse et aux espaces
        const emailValue = emailInput.value.trim().toLowerCase();
        const passwordValue = passwordInput.value;

        const user = db.users.find(
            u => u.email.toLowerCase() === emailValue && u.password === passwordValue
        );

        if (user) {
            // FIX: on ne stocke JAMAIS le mot de passe côté client
            const { password, ...safeUser } = user;
            sessionStorage.setItem('currentUser_v13', JSON.stringify(safeUser));
            window.location.href = `${user.role}.html`;
        } else {
            errorEl.innerText = 'Email ou mot de passe incorrect';
        }
    });
}

// 3. VERIF SESSION + LOGOUT
const currentUser = getCurrentUser();
if (!currentUser && !loginForm) window.location.href = 'index.html';

// FIX: si un utilisateur connecté arrive sur la mauvaise page de rôle,
// on le redirige automatiquement vers SA page, au lieu de le laisser
// sur une page vide/incohérente.
if (currentUser && !loginForm) {
    const currentPage = window.location.pathname.split('/').pop();
    const expectedPage = `${currentUser.role}.html`;
    if (currentPage !== expectedPage) {
        window.location.href = expectedPage;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.btn-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('currentUser_v13');
        window.location.href = 'index.html';
    });
});

// 4. ADMIN
if (currentUser?.role === 'admin') {
    const formCours = document.getElementById('formCours');
    const selectProf = document.getElementById('selectProf');
    const listeTousCours = document.getElementById('listeTousCours');

    db.users.filter(u => u.role === 'prof').forEach(prof => {
        selectProf.innerHTML += `<option value="${prof.id}">${prof.nom}</option>`;
    });

    formCours.addEventListener('submit', e => {
        e.preventDefault();

        const titreCours = document.getElementById('titreCours');
        const dateCours = document.getElementById('dateCours');

        // FIX: garde-fou si aucun prof n'existe / n'est sélectionné
        const profId = parseInt(selectProf.value, 10);
        if (!selectProf.value || Number.isNaN(profId)) {
            alert("Veuillez sélectionner un professeur (aucun prof disponible ?).");
            return;
        }

        db.cours.push({
            id: Date.now(),
            titre: titreCours.value,
            date: dateCours.value,
            profId,
            lienMeet: LIEN_MEET_PERMANENT,
            isLive: false
        });
        saveDB();
        formCours.reset();
        renderCoursAdmin();
    });

    const renderCoursAdmin = () => {
        listeTousCours.innerHTML = db.cours.map(c => {
            const prof = db.users.find(u => u.id === c.profId);
            return `<div class="card"><h4>${c.titre} ${c.isLive ? '🔴' : ''}</h4><p><b>Prof:</b> ${prof ? prof.nom : 'ERREUR'}</p><p><b>Date:</b> ${new Date(c.date).toLocaleString('fr-FR')}</p><button class="btn-danger" onclick="supprimerCours(${c.id})">Supprimer</button></div>`;
        }).join('');
    };
    renderCoursAdmin();

    // FIX: confirmation avant suppression définitive
    window.supprimerCours = (id) => {
        if (!confirm('Confirmer la suppression de ce cours ?')) return;
        db.cours = db.cours.filter(c => c.id !== id);
        saveDB();
        renderCoursAdmin();
    };
}

// 5. PROF
if (currentUser?.role === 'prof') {
    const listeCoursProf = document.getElementById('listeCoursProf');
    const formSupport = document.getElementById('formSupport');
    const selectCoursSupport = document.getElementById('selectCoursSupport');

    const mesCours = db.cours.filter(c => c.profId === currentUser.id);
    mesCours.forEach(c => selectCoursSupport.innerHTML += `<option value="${c.id}">${c.titre}</option>`);

    formSupport.addEventListener('submit', e => {
        e.preventDefault();

        const titreSupport = document.getElementById('titreSupport');
        const lienSupport = document.getElementById('lienSupport');

        if (!selectCoursSupport.value) {
            alert("Veuillez sélectionner un cours pour ce support.");
            return;
        }

        db.supports.push({
            id: Date.now(),
            coursId: parseInt(selectCoursSupport.value, 10),
            titre: titreSupport.value,
            lien: lienSupport.value
        });
        saveDB();
        alert('✅ Support ajouté !');
        formSupport.reset();
    });

    const renderCoursProf = () => {
        if (mesCours.length === 0) { listeCoursProf.innerHTML = '<p>Aucun cours programmé pour vous.</p>'; return; }
        listeCoursProf.innerHTML = mesCours.map(c => `
            <div class="card ${c.isLive ? 'card-live' : ''}">
                <h4>${c.titre}</h4>
                <p>📅 ${new Date(c.date).toLocaleString('fr-FR')}</p>
                ${c.isLive ? `<p style="color:red; font-weight:bold;">🔴 EN LIVE</p> <a href="${c.lienMeet}" target="_blank">REJOINDRE LE MEET</a>` : ''}
                <button onclick="toggleLive(${c.id})" class="${c.isLive ? 'btn-danger' : 'btn-live'}">${c.isLive ? '🛑 Couper le Live' : '▶️ Lancer le Live'}</button>
            </div>`
        ).join('');
    };
    renderCoursProf();

    window.toggleLive = (id) => {
        const cours = db.cours.find(c => c.id === id);
        cours.isLive = !cours.isLive;
        saveDB();
        location.reload();
    };
}

// 6. ETUDIANT AVEC AUTO-REFRESH
if (currentUser?.role === 'etudiant') {
    const listeCours = document.getElementById('listeCours');
    const listeSupports = document.getElementById('listeSupports');

    const renderCoursEtudiant = () => {
        loadDB(); // Recharge la DB toutes les 3s pour voir le live
        const coursLive = db.cours.filter(c => c.isLive);

        if (coursLive.length > 0) {
            listeCours.innerHTML = coursLive.map(c => `
                <div class="card card-live">
                    <h4>🔴 ${c.titre} - EN DIRECT</h4>
                    <a href="${c.lienMeet}" target="_blank"><button class="btn-live">🚨 REJOINDRE MAINTENANT 🚨</button></a>
                </div>`
            ).join('');
        } else {
            listeCours.innerHTML = '<div class="card"><p>Aucun cours en live pour le moment.</p></div>';
        }

        // Afficher les supports
        listeSupports.innerHTML = db.supports.length > 0 ? db.supports.map(s => {
            const cours = db.cours.find(c => c.id === s.coursId);
            return `<p>📄 <b>${s.titre}</b> - Cours: ${cours?.titre || ''} <a href="${s.lien}" target="_blank">Télécharger</a></p>`;
        }).join('') : '<p>Aucun support disponible.</p>';
    };

    renderCoursEtudiant();
    setInterval(renderCoursEtudiant, 3000); // Refresh toutes les 3 secondes
}