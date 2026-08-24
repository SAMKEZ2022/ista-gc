// ================== 1. DONNEES ==================
let COURS = JSON.parse(localStorage.getItem('COURS')) || [
    { titre: "Mathématiques Générales", date: "Lundi 24 Août - De 7:00 à 8:00", lien: "https://meet.google.com/uza-ifet-gxj" },
    { titre: "Génie Civil - Béton Armé", date: "Mercredi 26 Août - De 10:00 à 12:00", lien: "https://meet.google.com/abc-defg-hij" }
];

let DEVOIRS = JSON.parse(localStorage.getItem('DEVOIRS')) || [
    { titre: "Devoir 1: Dimensionnement Poutre", desc: "Rendu: Vendredi 29 Août 23h59" }
];

let USERS = JSON.parse(localStorage.getItem('USERS')) || [
    { email: "admin@ista-gc.com", password: "admin123", role: "admin" },
    { email: "prof.math@ista-gc.com", password: "1234", role: "prof" },
    { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
];

function saveData(){
    localStorage.setItem('COURS', JSON.stringify(COURS));
    localStorage.setItem('DEVOIRS', JSON.stringify(DEVOIRS));
    localStorage.setItem('USERS', JSON.stringify(USERS));
}

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
                if(user.role === 'admin'){ window.location.href = 'admin.html'; } 
                else if(user.role === 'prof'){ window.location.href = 'prof.html'; } 
                else { window.location.href = 'etudiant.html'; }
            } else {
                errorDiv.innerText = '❌ Email ou mot de passe incorrect';
            }
        });
    }

    // ================== 3. GESTION ADMIN ==================
    if(document.getElementById('listeUsers')){
        afficherUsers();
        afficherStats();

        // Formulaire Ajout User
        document.getElementById('formAddUser').addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = {
                email: document.getElementById('newEmail').value,
                password: document.getElementById('newPassword').value,
                role: document.getElementById('newRole').value
            };
            USERS.push(newUser);
            saveData();
            afficherUsers();
            e.target.reset();
            alert("✅ Utilisateur ajouté !");
        });
    }

    // ================== 4. AFFICHAGE PROF ==================
    if(document.getElementById('listeCoursProf')){
        afficherCours('listeCoursProf', false);
        afficherDevoirs('listeDevoirsProf');
    }

    // ================== 5. AFFICHAGE ÉTUDIANT ==================
    if(document.getElementById('listeCours')){
        afficherCours('listeCours', true);
        afficherDevoirs('listeDevoirs');
    }

});

// ================== FONCTIONS ADMIN ==================
function afficherUsers(){
    const liste = document.getElementById('listeUsers');
    liste.innerHTML = USERS.map((u, index) => `
        <div class="card user-card">
            <p><b>Email:</b> ${u.email}</p>
            <p><b>Rôle:</b> ${u.role}</p>
            ${u.role !== 'admin' ? `<button onclick="supprimerUser(${index})" class="btn-danger">Supprimer</button>` : ''}
        </div>
    `).join('');
}

function supprimerUser(index){
    if(confirm("Supprimer cet utilisateur ?")){
        USERS.splice(index, 1);
        saveData();
        afficherUsers();
    }
}

function afficherStats(){
    document.getElementById('totalCours').innerText = COURS.length;
    document.getElementById('totalDevoirs').innerText = DEVOIRS.length;
    document.getElementById('totalProfs').innerText = USERS.filter(u => u.role === 'prof').length;
    document.getElementById('totalEtudiants').innerText = USERS.filter(u => u.role === 'etudiant').length;
}

// ================== FONCTIONS COMMUNES ==================
function afficherCours(id, boutonRejoindre){
    document.getElementById(id).innerHTML = COURS.map(c => `
        <div class="card">
            <h4>${c.titre}</h4>
            <p>📅 ${c.date}</p>
            <a href="${c.lien}" target="_blank" class="${boutonRejoindre ? 'btn-success' : 'btn-secondary'}">
                ${boutonRejoindre ? '▶️ Rejoindre le Meet' : 'Voir le lien'}
            </a>
        </div>
    `).join('');
}

function afficherDevoirs(id){
    document.getElementById(id).innerHTML = DEVOIRS.map(d => `
        <div class="card"><h4>${d.titre}</h4><p>${d.desc}</p></div>
    `).join('');
}

function logout(){
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}