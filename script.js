// ================== 1. DONNEES + LOCALSTORAGE ==================
let COURS = JSON.parse(localStorage.getItem('COURS')) || [];
let DEVOIRS = JSON.parse(localStorage.getItem('DEVOIRS')) || [];
let SUPPORTS = JSON.parse(localStorage.getItem('SUPPORTS')) || []; // {id, cours, nom, fichier}
let DEPOTS = JSON.parse(localStorage.getItem('DEPOTS')) || []; // {id, devoir, etudiant, fichier, note}
let USERS = JSON.parse(localStorage.getItem('USERS')) || [
    { email: "admin@ista-gc.com", password: "admin123", role: "admin" },
    { email: "prof.math@ista-gc.com", password: "1234", role: "prof" },
    { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
];
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

function saveData(){
    localStorage.setItem('COURS', JSON.stringify(COURS));
    localStorage.setItem('DEVOIRS', JSON.stringify(DEVOIRS));
    localStorage.setItem('SUPPORTS', JSON.stringify(SUPPORTS));
    localStorage.setItem('DEPOTS', JSON.stringify(DEPOTS));
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
            } else { errorDiv.innerText = '❌ Email ou mot de passe incorrect'; }
        });
    }

    // ================== 3. ESPACE ADMIN ==================
    if(document.getElementById('listeUsers')){
        afficherStats(); afficherUsers(); afficherCoursAdmin(); afficherDevoirsAdmin();
        formAddUser.addEventListener('submit', (e) => { e.preventDefault(); USERS.push({email: newEmail.value, password: newPassword.value, role: newRole.value}); saveData(); afficherUsers(); afficherStats(); e.target.reset(); });
        formAddCours.addEventListener('submit', (e) => { e.preventDefault(); COURS.push({titre: newTitre.value, date: newDate.value, lien: newLien.value}); saveData(); afficherCoursAdmin(); afficherStats(); e.target.reset(); });
        formAddDevoir.addEventListener('submit', (e) => { e.preventDefault(); DEVOIRS.push({titre: newTitreDevoir.value, desc: newDescDevoir.value}); saveData(); afficherDevoirsAdmin(); afficherStats(); e.target.reset(); });
    }

    // ================== 4. ESPACE PROF ==================
    if(document.getElementById('listeCoursProf')){
        afficherCours('listeCoursProf', false);
        remplirSelectCours('supportCours');
        remplirSelectDevoir('supportDevoir');
        afficherSupportsProf();
        afficherDepotsProf();

        formAddSupport.addEventListener('submit', (e) => {
            e.preventDefault();
            const file = supportFile.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                SUPPORTS.push({id: Date.now(), cours: supportCours.value, nom: supportNom.value, fichier: reader.result});
                saveData(); afficherSupportsProf(); e.target.reset();
            }
            reader.readAsDataURL(file);
        });
    }

    // ================== 5. ESPACE ÉTUDIANT ==================
    if(document.getElementById('listeCours')){
        afficherCours('listeCours', true);
        remplirSelectDevoir('depotDevoir');
        afficherSupportsEtudiant();
        afficherDevoirsEtudiant();

        formDepot.addEventListener('submit', (e) => {
            e.preventDefault();
            const file = depotFile.files[0];
            if(!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                DEPOTS.push({id: Date.now(), devoir: depotDevoir.value, etudiant: currentUser.email, fichier: reader.result, note: ""});
                saveData(); afficherDevoirsEtudiant(); e.target.reset(); alert("✅ Copie déposée avec succès!");
            }
            reader.readAsDataURL(file);
        });
    }
});

// ================== FONCTIONS ADMIN ==================
function afficherUsers(){ listeUsers.innerHTML = USERS.map((u, i) => `<div class="card user-card"><p><b>Email:</b> ${u.email}</p><p><b>Rôle:</b> ${u.role}</p>${u.role!== 'admin'? `<button onclick="supprimerUser(${i})" class="btn-danger">Supprimer</button>` : ''}</div>`).join(''); }
function supprimerUser(i){ if(confirm("Supprimer?")){ USERS.splice(i, 1); saveData(); afficherUsers(); afficherStats(); } }
function afficherCoursAdmin(){ listeCoursAdmin.innerHTML = COURS.map((c, i) => `<div class="card"><h4>${c.titre}</h4><p>📅 ${c.date}</p><a href="${c.lien}" target="_blank" class="btn-secondary">Voir lien</a><button onclick="supprimerCours(${i})" class="btn-danger">Supprimer</button></div>`).join(''); }
function supprimerCours(i){ if(confirm("Supprimer?")){ COURS.splice(i, 1); saveData(); afficherCoursAdmin(); afficherStats(); } }
function afficherDevoirsAdmin(){ listeDevoirsAdmin.innerHTML = DEVOIRS.map((d, i) => `<div class="card"><h4>${d.titre}</h4><p>${d.desc}</p><button onclick="supprimerDevoir(${i})" class="btn-danger">Supprimer</button></div>`).join(''); }
function supprimerDevoir(i){ if(confirm("Supprimer?")){ DEVOIRS.splice(i, 1); saveData(); afficherDevoirsAdmin(); afficherStats(); } }
function afficherStats(){ totalCours.innerText = COURS.length; totalDevoirs.innerText = DEVOIRS.length; totalProfs.innerText = USERS.filter(u => u.role === 'prof').length; totalEtudiants.innerText = USERS.filter(u => u.role === 'etudiant').length; }

// ================== FONCTIONS PROF ==================
function afficherSupportsProf(){
    listeSupportsProf.innerHTML = SUPPORTS.map(s => `
        <div class="card">
            <h4>${s.nom}</h4><p><b>Cours:</b> ${s.cours}</p>
            <a href="${s.fichier}" download="${s.nom}" class="btn-secondary">Télécharger</a>
            <button onclick="supprimerSupport(${s.id})" class="btn-danger">Supprimer</button>
        </div>
    `).join('');
}
function supprimerSupport(id){ SUPPORTS = SUPPORTS.filter(s => s.id!== id); saveData(); afficherSupportsProf(); }

function afficherDepotsProf(){
    listeDepotsProf.innerHTML = DEPOTS.map(d => `
        <div class="card">
            <h4>${d.devoir}</h4>
            <p><b>Étudiant:</b> ${d.etudiant}</p>
            <a href="${d.fichier}" download="copie_${d.etudiant}.pdf" class="btn-secondary">Télécharger Copie</a>
            <input type="number" placeholder="Note /20" value="${d.note}" onchange="noterCopie(${d.id}, this.value)" style="width:100px;">
        </div>
    `).join('');
}
function noterCopie(id, note){ const depot = DEPOTS.find(d => d.id === id); depot.note = note; saveData(); }

// ================== FONCTIONS ÉTUDIANT ==================
function afficherSupportsEtudiant(){
    listeSupportsEtudiant.innerHTML = SUPPORTS.map(s => `
        <div class="card">
            <h4>${s.nom}</h4><p><b>Cours:</b> ${s.cours}</p>
            <a href="${s.fichier}" download="${s.nom}" class="btn-success">📥 Télécharger</a>
        </div>
    `).join('') || "<p>Aucun support pour le moment</p>";
}

function afficherDevoirsEtudiant(){
    listeDevoirsEtudiant.innerHTML = DEVOIRS.map(d => {
        const monDepot = DEPOTS.find(dep => dep.devoir === d.titre && dep.etudiant === currentUser.email);
        return `
        <div class="card">
            <h4>${d.titre}</h4><p>${d.desc}</p>
            ${monDepot? `<p class="success">✅ Déposé. Note: ${monDepot.note || 'En attente'}</p>` : `<p class="warning">❌ Pas encore déposé</p>`}
        </div>
    `}).join('') || "<p>Aucun devoir pour le moment</p>";
}

// ================== FONCTIONS COMMUNES ==================
function afficherCours(id, boutonRejoindre){
    document.getElementById(id).innerHTML = COURS.map(c => `
        <div class="card">
            <h4>${c.titre}</h4><p>📅 ${c.date}</p>
            <a href="${c.lien}" target="_blank" class="${boutonRejoindre? 'btn-success' : 'btn-secondary'}">${boutonRejoindre? '▶️ Rejoindre le Meet' : 'Voir le lien'}</a>
        </div>
    `).join('') || "<p>Aucun cours programmé</p>";
}
function remplirSelectCours(id){ document.getElementById(id).innerHTML = '<option value="">Choisir un cours</option>' + COURS.map(c => `<option>${c.titre}</option>`).join(''); }
function remplirSelectDevoir(id){ document.getElementById(id).innerHTML = '<option value="">Choisir un devoir</option>' + DEVOIRS.map(d => `<option>${d.titre}</option>`).join(''); }
function logout(){ localStorage.removeItem('currentUser'); window.location.href = 'login.html'; }