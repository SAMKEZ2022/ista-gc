const users = [
  { email: "prof.math@ista-gc.com", password: "1234", role: "prof" },
  { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
];

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const user = users.find(u => u.email === email && u.password === password);
  if(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    if(user.role === 'prof') window.location.href = 'prof.html';
    else window.location.href = 'espace-etudiant.html';
  } else {
    alert("Email ou mot de passe incorrect");
  }
}

function logout() {
  localStorage.removeItem('currentUser');
  window.location.href = 'login.html';
}

function checkAuth() {
  if(!localStorage.getItem('currentUser') && !window.location.href.includes('login.html')) {
    window.location.href = 'login.html';
  }
}

function showTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

function publierDevoir() {
  const titre = document.getElementById('titreDevoir').value;
  const desc = document.getElementById('descDevoir').value;
  const date = document.getElementById('dateDevoir').value;
  const lienSujet = document.getElementById('lienSujet').value;
  if(!titre || !date || !lienSujet) return alert("Remplis Titre, Date et Lien Sujet");
  const devoirs = JSON.parse(localStorage.getItem('devoirs')) || [];
  devoirs.push({id: Date.now(), titre, desc, date, lienSujet});
  localStorage.setItem('devoirs', JSON.stringify(devoirs));
  alert("Devoir publié");
  afficherDevoirsProf();
}

function afficherDevoirsProf() {
  const div = document.getElementById('listeDevoirsProf');
  if(!div) return;
  const devoirs = JSON.parse(localStorage.getItem('devoirs')) || [];
  div.innerHTML = devoirs.map(d => `
    <div class="card">
      <h4>${d.titre}</h4>
      <p>${d.desc}</p>
      <p><b>Date limite:</b> ${new Date(d.date).toLocaleString()}</p>
      <a href="${d.lienSujet}" target="_blank" class="btn">Voir le Sujet</a>
    </div>
  `).join('') || "<p>Aucun devoir publié</p>";
}

function afficherDevoirsEtudiant() {
  const div = document.getElementById('listeDevoirsEtudiant');
  if(!div) return;
  const devoirs = JSON.parse(localStorage.getItem('devoirs')) || [];
  const copies = JSON.parse(localStorage.getItem('copies')) || [];
  div.innerHTML = devoirs.map(d => {
    const maCopie = copies.find(c => c.devoirId === d.id);
    return `
    <div class="card">
      <h4>${d.titre}</h4>
      <p>${d.desc}</p>
      <p><b>Date limite:</b> ${new Date(d.date).toLocaleString()}</p>
      <a href="${d.lienSujet}" target="_blank" class="btn">📥 Télécharger le Sujet</a>
      <input type="text" id="lien_${d.id}" placeholder="Colle le lien Google Drive de TA copie ici">
      <button onclick="deposerCopie(${d.id})">${maCopie ? 'Modifier le lien' : 'Envoyer le lien'}</button>
      ${maCopie ? `<p style="color:green">✅ Déposé: <a href="${maCopie.lienCopie}" target="_blank">Voir ma copie</a></p>` : ''}
    </div>
  `}).join('') || "<p>Aucun devoir</p>";
}

function deposerCopie(devoirId) {
  const lienCopie = document.getElementById('lien_'+devoirId).value;
  if(!lienCopie) return alert("Colle ton lien Drive");
  const copies = JSON.parse(localStorage.getItem('copies')) || [];
  const index = copies.findIndex(c => c.devoirId === devoirId);
  const newCopie = {devoirId, lienCopie, date: new Date()};
  if(index > -1) copies[index] = newCopie; else copies.push(newCopie);
  localStorage.setItem('copies', JSON.stringify(copies));
  alert("Lien envoyé avec succès");
  afficherDevoirsEtudiant();
}

function afficherCopies() {
  const div = document.getElementById('listeCopies');
  if(!div) return;
  const copies = JSON.parse(localStorage.getItem('copies')) || [];
  const devoirs = JSON.parse(localStorage.getItem('devoirs')) || [];
  div.innerHTML = copies.map(c => {
    const devoir = devoirs.find(d => d.id === c.devoirId);
    return `
    <div class="card">
      <h4>Devoir: ${devoir ? devoir.titre : 'Supprimé'}</h4>
      <p><b>Déposé le:</b> ${new Date(c.date).toLocaleString()}</p>
      <a href="${c.lienCopie}" target="_blank" class="btn btn-danger">📥 Ouvrir la copie Drive</a>
    </div>
  `}).join('') || "<p>Aucune copie déposée</p>";
}

function creerLive() {
  const titre = document.getElementById('liveTitre').value;
  const date = document.getElementById('liveDate').value;
  const lien = document.getElementById('liveLien').value;
  if(!titre || !date || !lien) return alert("Remplis tout stp");
  const lives = JSON.parse(localStorage.getItem('lives')) || [];
  lives.push({id: Date.now(), titre, date, lien});
  localStorage.setItem('lives', JSON.stringify(lives));
  alert("Live programmé avec succès");
  document.getElementById('liveTitre').value = '';
  document.getElementById('liveLien').value = '';
  afficherLivesProf();
}

function afficherLivesProf() {
  const div = document.getElementById('listeLivesProf');
  if(!div) return;
  const lives = JSON.parse(localStorage.getItem('lives')) || [];
  div.innerHTML = lives.map(l => `
    <div class="card">
      <h4>${l.titre}</h4>
      <p><b>Date:</b> ${new Date(l.date).toLocaleString()}</p>
      <a href="${l.lien}" target="_blank" class="btn btn-danger">Rejoindre / Lancer le Meet</a>
    </div>
  `).join('') || "<p>Aucun live programmé</p>";
}

function afficherLivesEtudiant() {
  const div = document.getElementById('listeLivesEtudiant');
  if(!div) return;
  const lives = JSON.parse(localStorage.getItem('lives')) || [];
  const now = new Date();
  div.innerHTML = lives.sort((a,b) => new Date(a.date) - new Date(b.date)).map(l => {
    const dateLive = new Date(l.date);
    const diffMin = (dateLive - now) / 1000 / 60;
    let btn = '';
    if(diffMin > 10) {
      btn = `<button class="btn" disabled>À venir dans ${Math.floor(diffMin)} min</button>`;
    } else if(diffMin > 0 && diffMin <= 10) {
      btn = `<a href="${l.lien}" target="_blank" class="btn btn-danger">🔴 REJOINDRE MAINTENANT</a>`;
      if(!localStorage.getItem('notif_'+l.id)) {
        alert(`RAPPEL: Le cours "${l.titre}" commence dans 10min`);
        localStorage.setItem('notif_'+l.id, '1');
      }
    } else if(diffMin <= 0 && diffMin > -120) {
      btn = `<a href="${l.lien}" target="_blank" class="btn btn-danger">🔴 EN COURS - REJOINDRE</a>`;
    } else {
      btn = `<button class="btn" disabled>Terminé</button>`;
    }
    return `<div class="card"><h4>${l.titre}</h4><p><b>Date:</b> ${dateLive.toLocaleString()}</p>${btn}</div>`
  }).join('') || "<p>Aucun cours en live prévu</p>";
}

window.onload = function() {
  checkAuth();
  afficherDevoirsProf();
  afficherDevoirsEtudiant();
  afficherCopies();
  afficherLivesProf();
  afficherLivesEtudiant();
  setInterval(afficherLivesEtudiant, 60000);
}