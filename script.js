let COURS = JSON.parse(localStorage.getItem('COURS')) || [];
let DEVOIRS = JSON.parse(localStorage.getItem('DEVOIRS')) || [];
let SUPPORTS = JSON.parse(localStorage.getItem('SUPPORTS')) || [];
let DEPOTS = JSON.parse(localStorage.getItem('DEPOTS')) || [];
let USERS = JSON.parse(localStorage.getItem('USERS')) || [{ email: "admin@ista-gc.com", password: "admin123", role: "admin" }, { email: "prof.math@ista-gc.com", password: "1234", role: "prof" }, { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }];
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

function saveData(){ 
    localStorage.setItem('COURS', JSON.stringify(COURS)); 
    localStorage.setItem('DEVOIRS', JSON.stringify(DEVOIRS)); 
    localStorage.setItem('SUPPORTS', JSON.stringify(SUPPORTS)); 
    localStorage.setItem('DEPOTS', JSON.stringify(DEPOTS)); 
    localStorage.setItem('USERS', JSON.stringify(USERS)); 
    
    // FORCER LA MISE A JOUR SUR TOUTES LES PAGES
    window.dispatchEvent(new Event('storage'));
}

// ECOUTER LES CHANGEMENTS POUR ACTUALISER AUTOMATIQUEMENT
window.addEventListener('storage', () => {
    COURS = JSON.parse(localStorage.getItem('COURS')) || [];
    DEVOIRS = JSON.parse(localStorage.getItem('DEVOIRS')) || [];
    SUPPORTS = JSON.parse(localStorage.getItem('SUPPORTS')) || [];
    DEPOTS = JSON.parse(localStorage.getItem('DEPOTS')) || [];
    if(document.getElementById('listeCours')) afficherCoursEtudiant();
    if(document.getElementById('listeCoursProf')) afficherCoursProf();
});

document.addEventListener('DOMContentLoaded', () => {
    if(document.getElementById('loginForm')){ loginForm.addEventListener('submit', (e) => { e.preventDefault(); const user = USERS.find(u => u.email === email.value && u.password === password.value); if(user){ localStorage.setItem('currentUser', JSON.stringify(user)); window.location.href = user.role + '.html'; } else { error.innerText = '❌ Email ou mot de passe incorrect'; } }); }
    if(document.getElementById('listeUsers')){ afficherStats(); afficherUsers(); afficherCoursAdmin(); afficherDevoirsAdmin(); formAddUser.addEventListener('submit', (e) => { e.preventDefault(); USERS.push({email: newEmail.value, password: newPassword.value, role: newRole.value}); saveData(); afficherUsers(); afficherStats(); e.target.reset(); }); formAddCours.addEventListener('submit', (e) => { e.preventDefault(); COURS.push({id: Date.now(), titre: newTitre.value, date: newDate.value, lien: newLien.value, en_live: false}); saveData(); afficherCoursAdmin(); afficherStats(); e.target.reset(); }); formAddDevoir.addEventListener('submit', (e) => { e.preventDefault(); DEVOIRS.push({id: Date.now(), titre: newTitreDevoir.value, desc: newDescDevoir.value}); saveData(); afficherDevoirsAdmin(); afficherStats(); e.target.reset(); }); }
    if(document.getElementById('listeCoursProf')){ afficherCoursProf(); remplirSelectCours('supportCours'); afficherSupportsProf(); afficherDepotsProf(); formAddSupport.addEventListener('submit', (e) => { e.preventDefault(); const file = supportFile.files[0]; const reader = new FileReader(); reader.onload = () => { SUPPORTS.push({id: Date.now(), cours: supportCours.value, nom: supportNom.value, fichier: reader.result}); saveData(); afficherSupportsProf(); e.target.reset(); } reader.readAsDataURL(file); }); }
    if(document.getElementById('listeCours')){ afficherCoursEtudiant(); afficherSupportsEtudiant(); afficherDevoirsEtudiant(); remplirSelectDevoir('depotDevoir'); formDepot.addEventListener('submit', (e) => { e.preventDefault(); const file = depotFile.files[0]; const reader = new FileReader(); reader.onload = () => { DEPOTS.push({id: Date.now(), devoir: depotDevoir.value, etudiant: currentUser.email, fichier: reader.result, note: ""}); saveData(); afficherDevoirsEtudiant(); e.target.reset(); alert("✅ Copie déposée!"); } reader.readAsDataURL(file); }); }
});

function afficherUsers(){ if(document.getElementById('listeUsers')) listeUsers.innerHTML = USERS.map((u, i) => `<div class="card"><p><b>${u.email}</b> - ${u.role}</p>${u.role!== 'admin'? `<button onclick="supprimerUser(${i})" class="btn-danger">Supprimer</button>` : ''}</div>`).join(''); }
function supprimerUser(i){ if(confirm("Supprimer?")){ USERS.splice(i, 1); saveData(); afficherUsers(); afficherStats(); } }
function afficherCoursAdmin(){ if(document.getElementById('listeCoursAdmin')) listeCoursAdmin.innerHTML = COURS.map((c, i) => `<div class="card"><h4>${c.titre}</h4><p>📅 ${c.date} ${c.en_live? '🔴 LIVE' : ''}</p><button onclick="supprimerCours(${i})" class="btn-danger">Supprimer</button></div>`).join(''); }
function supprimerCours(i){ COURS.splice(i, 1); saveData(); afficherCoursAdmin(); afficherStats(); }
function afficherDevoirsAdmin(){ if(document.getElementById('listeDevoirsAdmin')) listeDevoirsAdmin.innerHTML = DEVOIRS.map((d, i) => `<div class="card"><h4>${d.titre}</h4><p>${d.desc}</p><button onclick="supprimerDevoir(${i})" class="btn-danger">Supprimer</button></div>`).join(''); }
function supprimerDevoir(i){ DEVOIRS.splice(i, 1); saveData(); afficherDevoirsAdmin(); afficherStats(); }
function afficherStats(){ if(document.getElementById('totalCours')){ totalCours.innerText = COURS.length; totalDevoirs.innerText = DEVOIRS.length; totalProfs.innerText = USERS.filter(u => u.role === 'prof').length; totalEtudiants.innerText = USERS.filter(u => u.role === 'etudiant').length; } }
function lancerCours(id){ COURS = COURS.map(c => c.id === id? {...c, en_live: true} : c); saveData(); afficherCoursProf(); alert("🔴 Le cours est LANCÉ!"); }
function couperCours(id){ COURS = COURS.map(c => c.id === id? {...c, en_live: false} : c); saveData(); afficherCoursProf(); alert("⚫ Le cours est TERMINÉ"); }
function afficherCoursProf(){ if(document.getElementById('listeCoursProf')) listeCoursProf.innerHTML = COURS.map(c => `<div class="card"><h4>${c.titre}</h4><p>📅 ${c.date}</p>${c.en_live? `<p class="live">🔴 EN LIVE</p><button onclick="couperCours(${c.id})" class="btn-danger">Couper le Live</button>` : `<button onclick="lancerCours(${c.id})" class="btn-success">▶️ Lancer le Live</button>`}</div>`).join('') || "<p>Aucun cours</p>"; }
function afficherSupportsProf(){ if(document.getElementById('listeSupportsProf')) listeSupportsProf.innerHTML = SUPPORTS.map(s => `<div class="card"><h4>${s.nom}</h4><p><b>Cours:</b> ${s.cours}</p><a href="${s.fichier}" download="${s.nom}" class="btn-secondary">Télécharger</a><button onclick="supprimerSupport(${s.id})" class="btn-danger">Supprimer</button></div>`).join('') || "<p>Aucun support</p>"; }
function supprimerSupport(id){ SUPPORTS = SUPPORTS.filter(s => s.id!== id); saveData(); afficherSupportsProf(); }
function afficherDepotsProf(){ if(document.getElementById('listeDepotsProf')) listeDepotsProf.innerHTML = DEPOTS.map(d => `<div class="card"><h4>${d.devoir}</h4><p><b>Étudiant:</b> ${d.etudiant}</p><a href="${d.fichier}" download="copie.pdf" class="btn-secondary">Télécharger Copie</a><input type="number" placeholder="Note /20" value="${d.note}" onchange="noterCopie(${d.id}, this.value)" style="width:100px;"></div>`).join('') || "<p>Aucune copie</p>"; }
function noterCopie(id, note){ const depot = DEPOTS.find(d => d.id === id); depot.note = note; saveData(); }
function afficherCoursEtudiant(){ if(document.getElementById('listeCours')){ const coursLive = COURS.filter(c => c.en_live === true); listeCours.innerHTML = coursLive.map(c => `<div class="card live-card"><h4>🔴 ${c.titre}</h4><p>📅 ${c.date}</p><a href="${c.lien}" target="_blank" class="btn-live">▶️ REJOINDRE MAINTENANT</a></div>`).join('') || "<p>Aucun cours en live pour le moment</p>"; } }
function afficherSupportsEtudiant(){ if(document.getElementById('listeSupportsEtudiant')) listeSupportsEtudiant.innerHTML = SUPPORTS.map(s => `<div class="card"><h4>${s.nom}</h4><p><b>Cours:</b> ${s.cours}</p><a href="${s.fichier}" download="${s.nom}" class="btn-success">📥 Télécharger</a></div>`).join('') || "<p>Aucun support pour le moment</p>"; }
function afficherDevoirsEtudiant(){ if(document.getElementById('listeDevoirsEtudiant')) listeDevoirsEtudiant.innerHTML = DEVOIRS.map(d => { const monDepot = DEPOTS.find(dep => dep.devoir === d.titre && dep.etudiant === currentUser.email); return `<div class="card"><h4>${d.titre}</h4><p>${d.desc}</p>${monDepot? `<p class="success">✅ Déposé. Note: ${monDepot.note || 'En attente'}</p>` : `<p class="warning">❌ Pas encore déposé</p>`}</div>`}).join('') || "<p>Aucun devoir</p>"; }
function remplirSelectCours(id){ if(document.getElementById(id)) document.getElementById(id).innerHTML = '<option value="">Choisir un cours</option>' + COURS.map(c => `<option>${c.titre}</option>`).join(''); }
function remplirSelectDevoir(id){ if(document.getElementById(id)) document.getElementById(id).innerHTML = '<option value="">Choisir un devoir</option>' + DEVOIRS.map(d => `<option>${d.titre}</option>`).join(''); }
function logout(){ localStorage.removeItem('currentUser'); window.location.href = 'login.html'; }