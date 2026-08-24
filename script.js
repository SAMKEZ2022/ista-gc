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
    { email: "admin@ista-gc.com", password: "admin123", role: "admin" },
    { email: "prof.math@ista-gc.com", password: "1234", role: "prof" },
    { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
];


// ================== 2. CONNEXION ==================
document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('loginForm');
    if(loginForm){
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const errorDiv = document.getElementById('error');
            const user = USERS.find(u => u.email === email && u.password === password);
            
            if(user){
                errorDiv.innerText = "";
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirection selon le rôle
                if(user.role === 'admin'){
                    window.location.href = 'admin.html';
                } else if(user.role === 'prof'){
                    window.location.href = 'prof.html';
                } else {
                    window.location.href = 'etudiant.html';
                }
                
            } else {
                errorDiv.innerText = '❌ Email ou mot de passe incorrect';
                errorDiv.style.color = 'red';
            }
        });
    }


    // ================== 3. AFFICHAGE ADMIN ==================
    if(document.getElementById('listeCoursAdmin')){
        document.getElementById('totalCours').innerText = COURS.length;
        document.getElementById('totalDevoirs').innerText = DEVOIRS.length;
        
        document.getElementById('listeCoursAdmin').innerHTML = COURS.map(c => `
            <div class="card">
                <h4>${c.titre}</h4>
                <p>📅 ${c.date}</p>
                <a href="${c.lien}" target="_blank" class="btn-secondary">Voir le lien</a>
            </div>
        `).join('');
    }


    // ================== 4. AFFICHAGE PROF ==================
    if(document.getElementById('listeCoursProf')){
        document.getElementById('listeCoursProf').innerHTML = COURS.map(c => `
            <div class="card">
                <h4>${c.titre}</h4>
                <p>📅 ${c.date}</p>
                <a href="${c.lien}" target="_blank" class="btn-secondary">Voir le lien</a>
            </div>
        `).join('');
        
        document.getElementById('listeDevoirsProf').innerHTML = DEVOIRS.map(d => `
            <div class="card"><h4>${d.titre}</h4><p>${d.desc}</p></div>
        `).join('');
    }


    // ================== 5. AFFICHAGE ÉTUDIANT ==================
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

});


// ================== 6. DECONNEXION ==================
function logout(){
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}