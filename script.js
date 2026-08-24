// 1. LES COMPTES
const USERS = [
    { email: "prof.math@ista-gc.com", password: "1234", role: "prof" },
    { email: "etudiant.gc@ista-gc.com", password: "1234", role: "etudiant" }
];

// 2. CONNEXION
if(document.getElementById('loginForm')){
    document.getElementById('loginForm').addEventListener('submit', function(e){
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const user = USERS.find(u => u.email === email && u.password === password);
        
        if(user){
            localStorage.setItem('currentUser', JSON.stringify(user));
            if(user.role === 'prof') window.location.href = 'prof.html';
            else window.location.href = 'etudiant.html';
        } else {
            document.getElementById('error').innerText = 'Email ou mot de passe incorrect';
        }
    });
}

// 3. FONCTIONS PROF
function ajouterCours(){
    let cours = JSON.parse(localStorage.getItem('cours')) || [];
    const nouveau = {
        titre: document.getElementById('titreCours').value,
        date: document.getElementById('dateCours').value,
        lien: document.getElementById('lienCours').value
    };
    cours.push(nouveau);
    localStorage.setItem('cours', JSON.stringify(cours));
    alert('Cours publié !');
}

function ajouterDevoir(){
    let devoirs = JSON.parse(localStorage.getItem('devoirs')) || [];
    const nouveau = {
        titre: document.getElementById('titreDevoir').value,
        desc: document.getElementById('descDevoir').value
    };
    devoirs.push(nouveau);
    localStorage.setItem('devoirs', JSON.stringify(devoirs));
    alert('Devoir publié !');
}

// 4. AFFICHAGE ÉTUDIANT
if(document.getElementById('listeCours')){
    const cours = JSON.parse(localStorage.getItem('cours')) || [];
    const devoirs = JSON.parse(localStorage.getItem('devoirs')) || [];
    
    if(cours.length === 0) document.getElementById('listeCours').innerHTML = 'Aucun cours en live prévu';
    else {
        document.getElementById('listeCours').innerHTML = cours.map(c => `
            <div class="card">
                <h4>${c.titre}</h4>
                <p>${c.date}</p>
                <a href="${c.lien}" target="_blank" class="btn">Rejoindre</a>
            </div>
        `).join('');
    }

    if(devoirs.length === 0) document.getElementById('listeDevoirs').innerHTML = 'Aucun devoir';
    else {
        document.getElementById('listeDevoirs').innerHTML = devoirs.map(d => `
            <div class="card">
                <h4>${d.titre}</h4>
                <p>${d.desc}</p>
            </div>
        `).join('');
    }
}

// 5. AUTRES FONCTIONS
function logout(){
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}
function showTab(tab){
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(tab).style.display = 'block';
}