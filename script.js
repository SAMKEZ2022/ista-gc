// ================== 1. DONNEES + LOCALSTORAGE ==================
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

    // ================== 3. ESPACE ADMIN ==================
    if(document.getElementById('listeUsers')){
        afficherStats();
        afficherUsers();
        afficherCoursAdmin();
        afficherDevoirsAdmin();

        // Ajout User
        document.getElementById('formAddUser').addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = { email: newEmail.value, password: newPassword.value, role: newRole.value };
            USERS.push(newUser); saveData(); afficherUsers(); afficherStats(); e.target.reset();
        });

        // Ajout Cours
        document.getElementById('formAddCours').addEventListener('submit', (e) => {
            e.preventDefault();
            const newCours = { titre: newTitre.value, date: newDate.value, lien: newLien.value };
            COURS.push(newCours); saveData(); afficherCoursAdmin(); afficherStats(); e.target.reset();
        });

        // Ajout Devoir
        document.getElementById('formAddDevoir').addEventListener('submit', (e) => {
            e.preventDefault();
            const newDevoir = { titre: newTitreDevoir.value, desc: newDescDevoir.value };
            DEVOIRS.push(newDevoir); saveData(); afficherDevoirsAdmin(); afficherStats(); e.target.reset();
        });
    }

    // ================== 4. ESPACE PROF ==================
    if(document.getElementById('listeCoursProf')){
        afficherCours('listeCoursProf', false);
        afficherDevoirs('listeDevoirsProf');
    }

    // ================== 5. ESPACE ÉTUDIANT ==================
    if(document.getElementById('listeCours')){
        afficherCours('listeCours', true);
        afficherDevoirs('listeDevoirs');
    }

});

// ================== FONCTIONS ADMIN ==================
function afficherUsers(){
    listeUsers.innerHTML = USERS.map((u, index) => `
        <div class="card user-card">
            <p><b>Email:</b> ${u.email}</p><p><b>Rôle:</b> ${u.role}</p>
            ${u.role !== 'admin' ? `<button onclick="supprimerUser(${index})" class="btn-danger">Supprimer</button>` : ''}
        </div>
    `).join('');
}
function supprimerUser(index){ if(confirm("Supprimer ?")){ USERS.splice(index, 1); saveData(); afficherUsers(); afficherStats(); } }

function afficherCoursAdmin(){
    listeCoursAdmin.innerHTML = COURS.map((c, index) => `
        <div class="card">
            <h4>${c.titre}</h4><p>📅 ${c.date}</p>
            <a href="${c.lien}" target="_blank" class="btn-secondary">Voir lien</a>
            <button onclick="supprimerCours(${index})" class="btn-danger">Supprimer</button>
        </div>
    `).join('');
}
function supprimerCours(index){ if(confirm("Supprimer ?")){ COURS.splice(index, 1); saveData(); afficherCoursAdmin(); afficherStats(); } }

function afficherDevoirsAdmin(){
    listeDevoirsAdmin.innerHTML = DEVOIRS.map((d, index) => `
        <div class="card">
            <h4>${d.titre}</h4><p>${d.desc}</p>
            <button onclick="supprimerDevoir(${index})" class="btn-danger">Supprimer</button>
        </div>
    `).join('');
}
function supprimerDevoir(index){ if(confirm("Supprimer ?")){ DEVOIRS.splice(index, 1); saveData(); afficherDevoirsAdmin(); afficherStats(); } }

function afficherStats(){
    totalCours.innerText = COURS.length;
    totalDevoirs.innerText = DEVOIRS.length;
    totalProfs.innerText = USERS.filter(u => u.role === 'prof').length;
    totalEtudiants.innerText = USERS.filter(u => u.role === 'etudiant').length;
}

// ================== FONCTIONS COMMUNES ==================
function afficherCours(id, boutonRejoindre){
    document.getElementById(id).innerHTML = COURS.map(c => `
        <div class="card">
            <h4>${c.titre}</h4><p>📅 ${c.date}</p>
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
function logout(){ localStorage.removeItem('currentUser'); window.location.href = 'login.html'; }