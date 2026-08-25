// V11.0 - LOGIQUE ADMIN COMPLETE
const LIEN_MEET_PERMANENT = 'https://meet.google.com/yyb-hgqr-crq'; // Ton lien par défaut

const db = {
    users: [
        { id: 1, email: 'admin@ista-gc.com', password: 'admin123', role: 'admin', nom: 'Admin' },
        { id: 2, email: 'prof.math@ista-gc.com', password: '1234', role: 'prof', nom: 'Prof. Koffi' },
        { id: 3, email: 'etudiant.gc@ista-gc.com', password: '1234', role: 'etudiant', nom: 'Etudiant GC' }
    ],
    cours: [], // VIDE AU DEPART. L'ADMIN VA REMPLIR
    supports: [],
    devoirs: [],
    depots: []
};

// FONCTIONS DB
const saveDB = () => localStorage.setItem('ista_gc_db', JSON.stringify(db));
const loadDB = () => { const data = localStorage.getItem('ista_gc_db'); if (data) Object.assign(db, JSON.parse(data)); };
loadDB();

// LOGIN
const loginForm = document.getElementById('loginForm');
if(loginForm){
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const user = db.users.find(u => u.email === email.value && u.password === password.value);
        if(user){
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = `${user.role}.html`;
        } else { error.innerText = 'Email ou mot de passe incorrect'; }
    });
}

// CHECK AUTH
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if(!currentUser && !loginForm) window.location.href = 'index.html';

// LOGOUT
document.querySelector('.btn-logout')?.addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'index.html';
});

// ================== ADMIN ==================
if(currentUser?.role === 'admin'){
    const formCours = document.getElementById('formCours');
    const selectProf = document.getElementById('selectProf');
    const listeTousCours = document.getElementById('listeTousCours');

    // 1. Remplir la liste des profs
    db.users.filter(u => u.role === 'prof').forEach(prof => {
        selectProf.innerHTML += `<option value="${prof.id}">${prof.nom}</option>`;
    });

    // 2. Ajouter un cours
    formCours.addEventListener('submit', e => {
        e.preventDefault();
        const newCours = {
            id: Date.now(),
            titre: titreCours.value,
            date: dateCours.value,
            profId: parseInt(selectProf.value),
            lienMeet: lienMeet.value || LIEN_MEET_PERMANENT,
            isLive: false
        };
        db.cours.push(newCours);
        saveDB();
        formCours.reset();
        renderCoursAdmin();
    });

    // 3. Afficher tous les cours
    const renderCoursAdmin = () => {
        listeTousCours.innerHTML = db.cours.map(c => {
            const prof = db.users.find(u => u.id === c.profId);
            return `
            <div class="card">
                <h4>${c.titre} ${c.isLive ? '🔴' : ''}</h4>
                <p><b>Prof:</b> ${prof.nom}</p>
                <p><b>Date:</b> ${new Date(c.date).toLocaleString('fr-FR')}</p>
                <button class="btn-danger" onclick="supprimerCours(${c.id})">Supprimer</button>
            </div>
            `;
        }).join('');
    };
    renderCoursAdmin();

    window.supprimerCours = (id) => {
        db.cours = db.cours.filter(c => c.id !== id);
        saveDB();
        renderCoursAdmin();
    };
}

// ================== PROF ==================
if(currentUser?.role === 'prof'){
    const listeCoursProf = document.getElementById('listeCoursProf');
    const mesCours = db.cours.filter(c => c.profId === currentUser.id);
    
    const renderCoursProf = () => {
        if(mesCours.length === 0) { listeCoursProf.innerHTML = '<p>Aucun cours programmé par l\'admin.</p>'; return; }
        listeCoursProf.innerHTML = mesCours.map(c => `
            <div class="card ${c.isLive ? 'card-live' : ''}">
                <h4>${c.titre}</h4>
                <p>📅 ${new Date(c.date).toLocaleString('fr-FR')}</p>
                ${c.isLive ? `<p style="color:red; font-weight:bold;">🔴 EN LIVE</p> <a href="${c.lienMeet}" target="_blank">REJOINDRE LE MEET</a>` : ''}
                <button onclick="toggleLive(${c.id})" class="${c.isLive ? 'btn-danger' : 'btn-live'}">
                    ${c.isLive ? '🛑 Couper le Live' : '▶️ Lancer le Live'}
                </button>
            </div>
        `).join('');
    };
    renderCoursProf();

    window.toggleLive = (id) => {
        const cours = db.cours.find(c => c.id === id);
        cours.isLive = !cours.isLive;
        saveDB();
        location.reload();
    };
}

// ================== ETUDIANT ==================
if(currentUser?.role === 'etudiant'){
    const listeCours = document.getElementById('listeCours');
    const coursLive = db.cours.filter(c => c.isLive);
    
    if(coursLive.length > 0){
        listeCours.innerHTML = coursLive.map(c => `
            <div class="card card-live">
                <h4>🔴 ${c.titre} - EN DIRECT</h4>
                <a href="${c.lienMeet}" target="_blank">
                    <button class="btn-live">🚨 REJOINDRE MAINTENANT 🚨</button>
                </a>
            </div>
        `).join('');
    } else {
        listeCours.innerHTML = '<div class="card"><p>Aucun cours en live pour le moment.</p></div>';
    }
}