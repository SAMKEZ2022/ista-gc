// ================== DONNEES ==================
const USERS = [
    { email: "prof.math@ista-gc.com", password: "1234", role: "prof" },
    { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
];

const COURS = [
    {
        titre: "Sans titre",
        date: "Lundi 24 Août - De 7:00 à 8:00",
        lien: "https://meet.google.com/uza-ifet-gxj"
    }
];

const DEVOIRS = [];

// ================== CONNEXION ==================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    
    if(form){
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Bloque le rechargement
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const errorDiv = document.getElementById('error');
            
            const user = USERS.find(u => u.email === email && u.password === password);
            
            if(user){
                errorDiv.innerText = "";
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Redirection
                if(user.role === 'prof'){
                    window.location.href = 'prof.html';
                } else {
                    window.location.href = 'etudiant.html';
                }
                
            } else {
                errorDiv.innerText = '❌ Email ou mot de passe incorrect';
            }
        });
    }
});


// ================== AFFICHAGE ÉTUDIANT ==================
if(document.getElementById('listeCours')){
    const divCours = document.getElementById('listeCours');
    divCours.innerHTML = COURS.length > 0 ? COURS.map(c => `
        <div class="card">
            <h4>${c.titre}</h4>
            <p>📅 ${c.date}</p>
            <a href="${c.lien}" target="_blank" class="btn">Rejoindre le cours</a>
        </div>
    `).join('') : '<p>Aucun cours en live prévu</p>';
}


// ================== DECONNEXION ==================
function logout(){
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}