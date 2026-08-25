// ... tout le code admin + prof reste identique ...

// ETUDIANT V11.3 AVEC AUTO-REFRESH
if(currentUser?.role === 'etudiant'){
    const listeCours = document.getElementById('listeCours');
    
    const renderCoursEtudiant = () => {
        const coursLive = db.cours.filter(c => c.isLive); // On relit la DB à chaque fois
        
        if(coursLive.length > 0){
            listeCours.innerHTML = coursLive.map(c => `
                <div class="card card-live">
                    <h4>🔴 ${c.titre} - EN DIRECT</h4>
                    <a href="${c.lienMeet}" target="_blank"><button class="btn-live">🚨 REJOINDRE MAINTENANT 🚨</button></a>
                </div>
            `).join('');
        } else { 
            listeCours.innerHTML = '<div class="card"><p>Aucun cours en live pour le moment.</p></div>'; 
        }
    };

    renderCoursEtudiant(); // Charge 1 fois au début
    setInterval(renderCoursEtudiant, 3000); // Puis recharge toutes les 3 secondes
}