// V10.9 - LOGIQUE LIVE CORRIGEE
const db = {
    users: [
        { id: 1, email: 'admin@ista-gc.com', password: 'admin123', role: 'admin' },
        { id: 2, email: 'prof.math@ista-gc.com', password: '1234', role: 'prof' },
        { id: 3, email: 'etudiant.gc@ista-gc.com', password: '1234', role: 'etudiant' }
    ],
    cours: [
        { id: 1, titre: 'Mathématiques Générales', date: '2026-08-25T14:00', profId: 2, isLive: false, lienMeet: 'https://meet.google.com/ista-gc-math' },
        { id: 2, titre: 'Physique Batiment', date: '2026-08-26T10:00', profId: 2, isLive: false, lienMeet: 'https://meet.google.com/ista-gc-physique' }
    ],
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

// PROF
if(currentUser?.role === 'prof'){
    const listeCoursProf = document.getElementById('listeCoursProf');
    const mesCours = db.cours.filter(c => c.profId === currentUser.id);
    
    const renderCoursProf = () => {
        listeCoursProf.innerHTML = mesCours.map(c => `
            <div class="card ${c.isLive ? 'card-live' : ''}">
                <h4>${c.titre}</h4>
                <p>📅 ${c.date}</p>
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
        location.reload(); // FORCE L'ETUDIANT A VOIR LE CHANGEMENT
    };
}

// ETUDIANT
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