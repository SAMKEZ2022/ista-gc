# ISTA-GC Platform V105

Plateforme E-learning complète pour l'ISTA-GC **Kara**.
Développée pour gérer les cours Live, Supports et Devoirs.

## 🔑 Rôles et Accès
| Rôle | Login Test | Ce qu'il peut faire |
| --- | --- | --- |
| **Admin** | `admin / admin123` | Valide/Rejette les devoirs proposés par les profs |
| **Prof** | `prof / prof123` | Lance le Live, Gère les supports, Propose des devoirs |
| **Etudiant** | `etudiant / etudiant123` | Suit le Live, Télécharge supports, Dépose devoirs |

## ✨ Nouveautés V105
1.  **Workflow Validation Admin** : Un devoir n'est visible par les étudiants que si l'Admin clique "Approuver".
2.  **Live Auto-Cut** : Le Live se coupe automatiquement après 2h.
3.  **Prêt Firebase** : Fichiers `firebase-config.js` et `GUIDE_FIREBASE.md` ajoutés pour le passage en temps réel.

## 🚀 Lancer en local
1.  Télécharge tout le dossier
2.  Ouvre `index.html` avec Google Chrome
3.  Connecte-toi avec un des comptes test ci-dessus

## 🔥 Passer sur Firebase - Temps Réel
Pour que le Live marche entre plusieurs PC:
1.  Crée un projet sur https://console.firebase.google.com
2.  Copie ta config dans `firebase-config.js`
3.  Suis les étapes dans `GUIDE_FIREBASE.md`

## 👨‍💻 Tech
HTML5, CSS3, JavaScript Vanilla, localStorage, Firebase Ready