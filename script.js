// FORCER LES DONNEES PAR DEFAUT AU 1ER CHARGEMENT
if(!localStorage.getItem('ISTAGC_LOADED_V10')){
    localStorage.clear();
    const DONNEES_DEFAUT = {
        COURS: [
            {id: 1, titre: "Mathématiques Générales", date: "2026-08-25T14:00", lien: "https://meet.google.com/ista-gc-math", en_live: false},
            {id: 2, titre: "Physique Batiment", date: "2026-08-26T10:00", lien: "https://meet.google.com/ista-gc-physique", en_live: false}
        ],
        DEVOIRS: [
            {id: 1, titre: "TD1 - Matrices", desc: "Faire les exos 1 à 5 page 12"},
            {id: 2, titre: "TP1 - Béton Armé", desc: "Rendu rapport + photos"}
        ],
        SUPPORTS: [],
        DEPOTS: [],
        USERS: [
            { email: "admin@ista-gc.com", password: "admin123", role: "admin" }, 
            { email: "prof.math@ista-gc.com", password: "1234", role: "prof" }, 
            { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
        ]
    }
    localStorage.setItem('COURS', JSON.stringify(DONNEES_DEFAUT.COURS));
    localStorage.setItem('DEVOIRS', JSON.stringify(DONNEES_DEFAUT.DEVOIRS));
    localStorage.setItem('SUPPORTS', JSON.stringify([]));
    localStorage.setItem('DEPOTS', JSON.stringify([]));
    localStorage.setItem('USERS', JSON.stringify(DONNEES_DEFAUT.USERS));
    localStorage.setItem('ISTAGC_LOADED_V10', 'true');
}

function getData(){ return { COURS: JSON.parse(localStorage.getItem('COURS')), DEVOIRS: JSON.parse(localStorage.getItem('DEVOIRS')), SUPPORTS: JSON.parse(localStorage.getItem('SUPPORTS')), DEPOTS: JSON.parse(localStorage.getItem('DEPOTS')), USERS: JSON.parse(localStorage.getItem('USERS')) }}
function saveData(data){ localStorage.setItem('COURS', JSON.stringify(data.COURS)); localStorage.setItem('DEVOIRS', JSON.stringify(data.DEVOIRS)); localStorage.setItem('SUPPORTS', JSON.stringify(data.SUPPORTS)); localStorage.setItem('DEPOTS', JSON.stringify(data.DEPOTS)); localStorage.setItem('USERS', JSON.stringify(data.USERS)); }

const currentUser = JSON.parse(localStorage.getItem('currentUser'));
setInterval(() => { if(document.getElementById('listeCours')) afficherCoursEtudiant(); if(document.getElementById('listeCoursProf')) afficherCoursProf(); }, 2000);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-logout').forEach(btn => { btn.addEventListener('click', logout); });
    if(document.getElementById('loginForm')){ loginForm.addEventListener('submit', (e) => { e.preventDefault(); let data = getData(); const user = data.USERS.find(u => u.email === email.value && u.password === password.value); if(user){ localStorage.setItem('currentUser', JSON.stringify(user)); window.location.href = user.role + '.html'; } else { error.innerText = '❌ Email ou mot de passe incorrect'; } }); }
    if(document.getElementById('listeUsers')){ afficherStats(); afficherUsers(); afficherCoursAdmin(); afficherDevoirsAdmin(); formAddUser.addEventListener('submit', (e) => { e.preventDefault(); let data = getData(); data.USERS.push({email: newEmail.value, password: newPassword.value, role: newRole.value}); saveData(data); afficherUsers(); afficherStats(); e.target.reset(); }); formAddCours.addEventListener('submit', (e) => { e.preventDefault(); let data = getData(); data.COURS.push({id: Date.now(), titre: newTitre.value, date: newDate.value, lien: newLien.value, en_live: false}); saveData(data); afficherCoursAdmin(); afficherStats(); e.target.reset(); }); formAddDevoir.addEventListener('submit', (e) => { e.preventDefault(); let data = getData(); data.DEVOIRS.push({id: Date.now(), titre: newTitreDevoir.value, desc: newDescDevoir.value}); saveData(data); afficherDevoirsAdmin(); afficherStats(); e.target.reset(); }); }
    if(document.getElementById('listeCoursProf')){ afficherCoursProf(); remplirSelectCours('supportCours'); afficherSupportsProf(); afficherDepotsProf(); formAddSupport.addEventListener('submit', (e) => { e.preventDefault(); let data = getData(); const file = supportFile.files[0]; const reader = new FileReader(); reader.onload = () => { data.SUPPORTS.push({id: Date.now(), cours: supportCours.value, nom: supportNom.value, fichier: reader.result}); saveData(data); afficherSupportsProf(); e.target.reset(); } reader.readAsDataURL(file); }); }
    if(document.getElementById('listeCours')){ afficherCoursEtudiant(); afficherSupportsEtudiant(); afficherDevoirsEtudiant(); remplirSelectDevoir('depotDevoir'); formDepot.addEventListener('submit', (e) => { e.preventDefault(); let data = getData(); const file = depotFile.files[0]; const reader = new FileReader(); reader.onload = () => { data.DEPOTS.push({id: Date.now(), devoir: depotDevoir.value, etudiant: currentUser.email, fichier: reader.result, note: ""}); saveData(data); afficherDevoirsEtudiant(); e.target.reset(); alert("✅ Copie déposée!"); } reader.readAsDataURL(file); }); }
});

function afficherUsers(){ let data = getData(); if(document.getElementById('listeUsers')) listeUsers.innerHTML = data.USERS.map((u, i) => `<div class="card"><p><b>${u.email}</b> - ${u.role}</p>${u.role!== 'admin'? `<button onclick="supprimerUser(${i})" class="btn-danger">Supprimer</button>` : ''}</div>`).join(''); }
function supprimerUser(i){ if(confirm("Supprimer?")){ let data = getData(); data.USERS.splice(i, 1); saveData(data); afficherUsers(); afficherStats(); } }
function afficherCoursAdmin(){ let data = getData(); if(document.getElementById('listeCoursAdmin')) listeCoursAdmin.innerHTML = data.COURS.map((c, i) => `<div class="card"><h4>${c.titre}</h4><p>📅 ${c.date} ${c.en_live? '🔴 LIVE' : ''}</p><button onclick="supprimerCours(${i})" class="btn-danger">Supprimer</button></div>`).join(''); }
function supprimerCours(i){ let data = getData(); data.COURS.splice(i, 1); saveData(data); afficherCoursAdmin(); afficherStats(); }
function afficherDevoirsAdmin(){ let data = getData(); if(document.getElementById('listeDevoirsAdmin')) listeDevoirsAdmin.innerHTML = data.DEVOIRS.map((d, i) => `<div class="card"><h4>${d.titre}</h4><p>${d.desc}</p><button onclick="supprimerDevoir(${i})" class="btn-danger">Supprimer</button></div>`).join(''); }
function supprimerDevoir(i){ let data = getData(); data.DEVOIRS.splice(i, 1); saveData(data); afficherDevoirsAdmin(); afficherStats(); }
function afficherStats(){ let data = getData(); if(document.getElementById('totalCours')){ totalCours.innerText = data.COURS.length; totalDevoirs.innerText = data.DEVOIRS.length; totalProfs.innerText = data.USERS.filter(u => u.role === 'prof').length; totalEtudiants.innerText = data.USERS.filter(u => u.role === 'etudiant').length; }}
function lancerCours(id){ let data = getData(); data.COURS = data.COURS.map(c => c.id === id? {...c, en_live: true} : c); saveData(data); afficherCoursProf(); alert("🔴 Le cours est LANCÉ!"); }
function couperCours(id){ let data = getData(); data.COURS = data.COURS.map(c => c.id === id? {...c, en_live: false} : c); saveData(data); afficherCoursProf(); alert("⚫ Le cours est TERMINÉ"); }
function afficherCoursProf(){ let data = getData(); if(document.getElementById('listeCoursProf')) listeCoursProf.innerHTML = data.COURS.map(c => `<div class="card"><h4>${c.titre}</h4><p>📅 ${c.date}</p>${c.en_live? `<p class="live">🔴 EN LIVE</p><button onclick="couperCours(${c.id})" class="btn-danger">Couper le Live</button>` : `<button onclick="lancerCours(${c.id})" class="btn-success">▶️ Lancer le Live</button>`}</div>`).join('') || "<p>Aucun cours</p>"; }
function afficherSupportsProf(){ let data = getData(); if(document.getElementById('listeSupportsProf')) listeSupportsProf.innerHTML = data.SUPPORTS.map(s => `<div class="card"><h4>${s.nom}</h4><p><b>Cours:</b> ${s.cours}</p><a href="${s.fichier}" download="${s.nom}" class="btn-secondary">Télécharger</a><button onclick="supprimerSupport(${s.id})" class="btn-danger">Supprimer</button></div>`).join('') || "<p>Aucun support</p>"; }
function supprimerSupport(id){ let data = getData(); data.SUPPORTS = data.SUPPORTS.filter(s => s.id!== id); saveData(data); afficherSupportsProf(); }
function afficherDepotsProf(){ let data = getData(); if(document.getElementById('listeDepotsProf')) listeDepotsProf.innerHTML = data.DEPOTS.map(d => `<div class="card"><h4>${d.devoir}</h4><p><b>Étudiant:</b> ${d.etudiant}</p><a href="${d.fichier}" download="copie.pdf" class="btn-secondary">Télécharger Copie</a><input type="number" placeholder="Note /20" value="${d.note}" onchange="noterCopie(${d.id}, this.value)" style="width:100px;"></div>`).join('') || "<p>Aucune copie</p>"; }
function noterCopie(id, note){ let data = getData(); const depot = data.DEPOTS.find(d => d.id === id); depot.note = note; saveData(data); }
function afficherCoursEtudiant(){ let data = getData(); if(document.getElementById('listeCours')){ const coursLive = data.COURS.filter(c => c.en_live === true); listeCours.innerHTML = coursLive.map(c => `<div class="card live-card"><h4>🔴 ${c.titre}</h4><p>📅 ${c.date}</p><a href="${c.lien}" target="_blank" class="btn-live">▶️ REJOINDRE MAINTENANT</a></div>`).join('') || "<p>Aucun cours en live pour le moment</p>"; } }
function afficherSupportsEtudiant(){ let data = getData(); if(document.getElementById('listeSupportsEtudiant')) listeSupportsEtudiant.innerHTML = data.SUPPORTS.map(s => `<div class="card"><h4>${s.nom}</h4><p><b>Cours:</b> ${s.cours}</p><a href="${s.fichier}" download="${s.nom}" class="btn-success">📥 Télécharger</a></div>`).join('') || "<p>Aucun support pour le moment</p>"; }
function afficherDevoirsEtudiant(){ let data = getData(); if(document.getElementById('listeDevoirsEtudiant')) listeDevoirsEtudiant.innerHTML = data.DEVOIRS.map(d => { const monDepot = data.DEPOTS.find(dep => dep.devoir === d.titre && dep.etudiant === currentUser.email); return `<div class="card"><h4>${d.titre}</h4><p>${d.desc}</p>${monDepot? `<p class="success">✅ Déposé. Note: ${monDepot.note || 'En attente'}</p>` : `<p class="warning">❌ Pas encore déposé</p>`}</div>`}).join('') || "<p>Aucun devoir</p>"; }
function remplirSelectCours(id){ let data = getData(); if(document.getElementById(id)) document.getElementById(id).innerHTML = '<option value="">Choisir un cours</option>' + data.COURS.map(c => `<option>${c.titre}</option>`).join(''); }
function remplirSelectDevoir(id){ let data = getData(); if(document.getElementById(id)) document.getElementById(id).innerHTML = '<option value="">Choisir un devoir</option>' + data.DEVOIRS.map(d => `<option>${d.titre}</option>`).join(''); }
function logout(){ localStorage.removeItem('currentUser'); window.location.href = 'index.html'; }