// V11.5 - FIX LIVE POUR ETUDIANT MOBILE
const LIEN_MEET_PERMANENT = 'https://meet.google.com/yyb-hgqr-crq';

const db = { users: [ { id: 1, email: 'admin@ista-gc.com', password: 'admin123', role: 'admin', nom: 'Admin ISTA' }, { id: 2, email: 'prof.math@ista-gc.com', password: '1234', role: 'prof', nom: 'Prof. Koffi' }, { id: 3, email: 'etudiant.gc@ista-gc.com', password: '1234', role: 'etudiant', nom: 'Etudiant GC' } ], cours: [], supports: [], devoirs: [], depots: [] };

const saveDB = () => localStorage.setItem('ista_gc_db', JSON.stringify(db));
const loadDB = () => { const data = localStorage.getItem('ista_gc_db'); if (data) Object.assign(db, JSON.parse(data)); };
loadDB(); // Charge 1 fois au début

// LOGIN + LOGOUT - identique à V11.4
const loginForm = document.getElementById('loginForm');
if(loginForm){ loginForm.addEventListener('submit', e => { e.preventDefault(); const user = db.users.find(u => u.email === email.value && u.password === password.value); if(user){ sessionStorage.setItem('currentUser', JSON.stringify(user)); window.location.href = `${user.role}.html`; } else { error.innerText = 'Email ou mot de passe incorrect'; } }); }
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if(!currentUser && !loginForm) window.location.href = 'index.html';
document.addEventListener('DOMContentLoaded', () => { document.querySelector('.btn-logout')?.addEventListener('click', () => { sessionStorage.removeItem('currentUser'); window.location.href = 'index.html'; }); });

// ADMIN + PROF - identique à V11.4
if(currentUser?.role === 'admin'){ /* ... code admin ... */ }
if(currentUser?.role === 'prof'){ /* ... code prof ... */ }

// ETUDIANT V11.5 CORRIGÉ
if(currentUser?.role === 'etudiant'){
    const listeCours = document.getElementById('listeCours');
    const listeSupports = document.getElementById('listeSupports');
    
    const renderCoursEtudiant = () => {
        loadDB(); // <-- LA LIGNE MAGIQUE : On relit la DB à chaque fois
        const coursLive = db.cours.filter(c => c.isLive);
        
        if(coursLive.length > 0){
            listeCours.innerHTML = coursLive.map(c => `<div class="card card-live"><h4>🔴 ${c.titre} - EN DIRECT</h4><a href="${c.lienMeet}" target="_blank"><button class="btn-live">🚨 REJOINDRE MAINTENANT 🚨</button></a></div>`).join('');
        } else { listeCours.innerHTML = '<div class="card"><p>Aucun cours en live pour le moment.</p></div>'; }
    };

    renderCoursEtudiant();
    setInterval(renderCoursEtudiant, 3000); // Recharge toutes les 3s
}