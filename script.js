// ================== 1. DONNEES ==================
const COURS = [
    {
        titre: "Mathématiques Générales",
        date: "Lundi 24 Août - De 7:00 à 8:00",
        lien: "https://meet.google.com/uza-ifet-gxj"
    },
    {
        titre: "Génie Civil - Béton Armé",
        date: "Mercredi 26 Août - De 10:00 à 12:00",
        lien: "https://meet.google.com/abc-defg-hij"
    }
];

const DEVOIRS = [
    {
        titre: "Devoir 1: Dimensionnement Poutre",
        desc: "Rendu: Vendredi 29 Août 23h59"
    }
];

const USERS = [
    { email: "prof.math@ista-gc.com", password: "1234", role: "prof" },
    { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
];

// ================== 2. LOGIQUE ==================
document.addEventListener('DOMContentLoaded', () => {
    
    // CONNEXION
    const loginForm = document.getElementById('loginForm');
    if(loginForm){
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const user = USERS.find(u => u.email === email && u.password === password);
            
            if(user){
                localStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = user.role === 'prof' ? 'prof.html' : 'etudiant.html';
            } else {
                document.getElementById('error').innerText = '❌ Email ou mot de passe incorrect';
            }
        });
    }

    // AFFICHAGE ÉTUDIANT
    if(document.getElementById('listeCours')){
        if(COURS.length === 0) {
            document.getElementById('listeCours').innerHTML = '<p>Aucun cours programmé</p>';
        } else {
            document.getElementById('listeCours').innerHTML = COURS.map(c => `
                <div class="card">
                    <h4>${c.titre}</h4>
                    <p>📅 ${c.date}</p>
                    <a href="${c.lien}" target="_blank" class="btn-success">▶️ Rejoindre le Meet</a>
                </div>
            `).join('');
        }
        document.getElementById('listeDevoirs').innerHTML = DEVOIRS.map(d => `
            <div class="card"><h4>${d.titre}</h4><p>${d.desc}</p></div>
        `).join('');
    }

    // AFFICHAGE PROF
    if(document.getElementById('listeCoursProf')){
        document.getElementById('listeCoursProf').innerHTML = COURS.map(c => `
            <div class="card">
                <h4>${c.titre}</h4>
                <p>${c.date}</p>
                <a href="${c.lien}" target="_blank" class="btn-secondary">Voir le lien</a>
            </div>
        `).join('');
        document.getElementById('listeDevoirsProf').innerHTML = DEVOIRS.map(d => `
            <div class="card"><h4>${d.titre}</h4><p>${d.desc}</p></div>
        `).join('');
    }
});

// DECONNEXION
function logout(){
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}