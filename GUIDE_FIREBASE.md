# Migration vers Firebase — Guide d'installation

## Ce qui a changé

Avant, `localStorage` stockait les données **dans le navigateur de chaque personne** —
c'est pourquoi un prof qui lançait un Live ne pouvait pas réellement prévenir un
étudiant sur un autre appareil : rien n'était partagé.

Maintenant, tout passe par **Firebase Firestore** avec écoute en temps réel
(`onSnapshot`). Concrètement :

1. Le prof clique sur **"Lancer le Live"** → le document du cours est mis à jour
   dans Firestore (`en_live: true`).
2. Firestore **pousse ce changement instantanément** à tous les navigateurs
   connectés (sans rafraîchissement, sans délai d'attente).
3. Chaque étudiant **de la même série** (`c.serie === currentUser.serie`) voit
   apparaître automatiquement : la bannière rouge en haut, la carte du cours
   avec le lien Jitsi intégré, un son d'alerte, et une notification navigateur.
4. Les étudiants d'une autre série ne sont pas dérangés — seuls les
   "concernés" reçoivent le lien.

## Étape 1 — Créer le projet Firebase

1. Va sur https://console.firebase.google.com et crée un projet (gratuit).
2. Dans **Build > Firestore Database**, clique sur "Créer une base de données"
   (mode production ou test, peu importe pour commencer).
3. Dans les paramètres du projet (roue crantée), section "Vos applications",
   ajoute une **application Web** (icône `</>`). Firebase te donne un objet
   `firebaseConfig` avec `apiKey`, `projectId`, etc.

## Étape 2 — Renseigner la config

Ouvre le fichier **`firebase-config.js`** (fourni) et remplace les valeurs
`VOTRE_...` par celles que Firebase t'a données. C'est le seul fichier à
modifier pour connecter l'app à ton projet.

## Étape 3 — Règles de sécurité Firestore + Authentification anonyme

Si tu utilises des règles qui exigent d'être authentifié, par exemple :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

...il faut impérativement activer l'**authentification anonyme** de Firebase,
sinon **toute l'app est bloquée** (login, live, tout) car elle n'utilisait pas
le SDK Firebase Auth auparavant.

1. Dans la console Firebase : **Build > Authentication > Sign-in method**.
2. Active le fournisseur **"Anonyme"**.
3. C'est tout — `firebase-config.js` connecte désormais chaque navigateur
   anonymement dès le chargement de la page (`signInAnonymously`), ce qui
   satisfait `request.auth != null`. Votre système de rôles
   (admin/prof/étudiant) continue d'être géré "à la main" via la collection
   Firestore `users` : l'authentification anonyme ne fait que débloquer
   l'accès à la base, elle ne remplace pas votre logique de connexion par
   email/mot de passe.

⚠️ Avec ces règles, n'importe quel visiteur anonyme peut quand même lire/
écrire toute la base (y compris les mots de passe en clair dans `users`) —
elles empêchent juste les robots/scripts complètement extérieurs à
l'application. Pour une vraie protection par rôle, il faudrait remplacer le
login "maison" par de vraies sessions **Firebase Authentication**
(email/mot de passe) et des règles qui vérifient, par exemple,
`request.auth.token.role == 'admin'` via des "custom claims". Je peux faire
cette migration si vous voulez sécuriser sérieusement l'app.

## Étape 4 — Ajouter Firebase aux 3 autres pages

Je n'ai reçu que `admin.html` dans le zip (pas `index.html`, `prof.html`,
`etudiant.html`, `style.css`). `admin.html` a déjà été mis à jour ci-joint.
Pour les 3 autres, ajoute exactement ces 3 lignes dans le `<head>`,
**avant** le `<script src="./script.js">` :

```html
<script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.13.0/firebase-auth-compat.js"></script>
<script src="./firebase-config.js"></script>
```

Et place `firebase-config.js` dans le même dossier que les pages HTML.

Aucune autre modification n'est nécessaire dans ces pages : tous les `id`
(`listeCours`, `listeCoursProf`, `loginForm`, etc.) sont restés identiques,
`script.js` s'y raccroche automatiquement.

## Étape 5 — Premier lancement

Au tout premier chargement de la page de connexion, `script.js` recrée
automatiquement les comptes et cours de démonstration dans Firestore
(mêmes identifiants qu'avant : `admin@ista-gc.com` / `admin123`, etc.). Cela
ne se produit qu'une seule fois grâce à un document `_meta/init`.

## Ce qui n'a pas changé

- Les 5 séries, les salles Jitsi fixes, la logique de conflit de salle.
- La structure des pages, les noms des fonctions appelées en `onclick`.
- Le dépôt de fichiers (support de cours, copies d'étudiants) — toujours en
  base64, mais désormais avec un plafond conseillé de ~700 Ko à cause de la
  limite de 1 Mo par document Firestore (au lieu de la limite du navigateur).

## Amélioration ajoutée par rapport à l'original

Dans la version `localStorage`, un étudiant voyait **tous** les cours en live
de toutes les séries. J'ai filtré l'affichage et les notifications pour ne
montrer aux étudiants **que les cours de leur propre série** — ce qui
correspond à "les étudiants concernés" dans votre demande.
