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

## Filières et salles (mise à jour)

- Nouvelle filière **Agronomie** ajoutée, avec ses propres salles Jitsi.
- Nouvelle filière **Tronc Commun**, avec une salle par niveau, pour les cours
  communs à plusieurs filières.
- Chaque filière (y compris Tronc Commun) dispose désormais de **5 niveaux/
  salles** : L1/BTS 1, L2/BTS 2, L3, **Master 1** et **Master 2**.
- Le logo a été corrigé : "ISTR" → "ISTA".

## Ce qui n'a pas changé

- Les séries, les salles Jitsi fixes, la logique de conflit de salle.
- La structure des pages, les noms des fonctions appelées en `onclick`.
- Le dépôt de fichiers (support de cours, copies d'étudiants) — toujours en
  base64, mais désormais avec un plafond conseillé de ~700 Ko à cause de la
  limite de 1 Mo par document Firestore (au lieu de la limite du navigateur).

## Amélioration ajoutée par rapport à l'original

Dans la version `localStorage`, un étudiant voyait **tous** les cours en live
de toutes les séries. J'ai filtré l'affichage et les notifications pour ne
montrer aux étudiants **que les cours de leur propre série** — ce qui
correspond à "les étudiants concernés" dans votre demande.

## Historique : le prof a un temps programmé ses propres cours (revenu en arrière)

Une version intermédiaire de l'app laissait chaque prof créer lui-même ses
cours depuis `prof.html`. **Ce n'est plus le cas** : voir la section
"Nouveau : seul l'admin programme les cours" plus bas, qui décrit le
fonctionnement actuel.

## Nouveau : Gestion des Matières par niveau (admin → prof)

Nouvelle collection Firestore **`matieres`**. Chaque document représente une
matière rattachée à une **série** et un **niveau**, avec un professeur
attribué (ou aucun) :

```
{ nom: "Mathématiques Générales", serie: "gc", niveau: 1, profId: "abc123", profEmail: "prof.math@ista-gc.com" }
```

### Côté admin (`admin.html`)

Nouvelle section **"📘 Gestion des Matières"**, juste après la gestion des
utilisateurs :

- L'admin crée une matière : nom + série + niveau.
- Sous chaque matière listée, un menu déroulant liste **uniquement les
  professeurs de la même série** (`state.USERS.filter(u => u.role === 'prof' && u.serie === m.serie)`)
  et permet de l'attribuer (ou de retirer l'attribution avec "Aucun
  professeur"). L'attribution est immédiate (mise à jour Firestore), pas
  besoin de bouton "Valider" séparé.
- Une matière peut être supprimée à tout moment (les cours déjà programmés
  ne sont pas affectés).
- Le compteur "Matières" a été ajouté aux statistiques du tableau de bord.

### Côté prof (`prof.html`)

- Nouvelle section **"📘 Mes Matières"** : liste en lecture seule des
  matières que l'admin lui a attribuées (nom + niveau + série).
- Ces matières ne servent plus à créer des cours depuis l'espace prof (voir
  section suivante) : elles servent uniquement de référence, et déterminent
  **quel prof peut lancer le Live** d'un cours donné quand l'admin relie ce
  cours à une matière.

### Sécurité

Les règles Firestore actuelles (`allow read, write: if request.auth != null`)
couvrent automatiquement la nouvelle collection `matieres` — aucune
modification de `firestore.rules` n'était nécessaire.

## Nouveau : seul l'admin programme les cours, le prof ne fait que lancer le Live

Changement de workflow demandé : le formulaire **"📅 Programmer un cours"**
a été **retiré de `prof.html`**. Il n'existe plus que sur `admin.html`. Le
prof garde uniquement la section **"Mes Cours & Live"**, où il peut lancer
ou couper le Live des cours que l'admin a programmés pour lui.

### Le formulaire admin peut maintenant partir d'une matière

Le formulaire de l'admin **"📅 Programmer un cours"** propose un nouveau
menu déroulant **"Matière"** (`#coursMatiereAdmin`), rempli avec **toutes**
les matières existantes (avec le nom du prof attribué entre parenthèses,
ou "non attribuée"). En choisir une :

- préremplit automatiquement la **série** et le **niveau/salle** du cours ;
- préremplit le **titre** du cours (si le champ est encore vide) ;
- affiche/masque automatiquement la case "Séries concernées" si la série
  de la matière est "Tronc Commun" ;
- enregistre `matiereId` et `matiereNom` sur le document `cours` créé.

L'admin garde la possibilité de laisser "-- Saisie libre --" et de tout
choisir manuellement comme avant (série, salle/niveau), pour les cours qui
ne correspondent à aucune matière du référentiel.

### Qui peut lancer le Live d'un cours ? (`coursGereParProf`)

Nouvelle fonction centrale dans `script.js`, utilisée partout où un prof
gère un cours (liste "Mes Cours & Live", bouton Lancer/Couper le Live,
liste et envoi des supports de cours) :

- Le prof doit être de la **même série** que le cours (condition de base,
  inchangée).
- Si le cours **n'est rattaché à aucune matière** (créé en "saisie libre"
  par l'admin — notamment les cours de Tronc Commun), il reste géré par
  **tous les profs de la série**, comme avant.
- Si le cours est rattaché à une matière **sans professeur attribué**, il
  reste géré par tous les profs de la série (en attendant que l'admin
  fasse l'attribution).
- Si le cours est rattaché à une matière **avec un professeur attribué**,
  **seul ce professeur** voit le cours dans "Mes Cours & Live", peut lancer/
  couper son Live, et peut lui envoyer un support de cours. Les autres
  profs de la même série ne le voient plus du tout dans leur espace.

### Supports de cours envoyés aux bons étudiants

Ce point était déjà correct avant cette mise à jour et n'a pas eu besoin
d'être changé : un support de cours est rattaché à un `coursId`, et
`afficherSupportsEtudiant()` ne montre à un étudiant que les supports dont
le cours le concerne réellement, via la même fonction centrale
`coursConcerneEtudiant()` utilisée pour les cours en Live (même niveau ET
(même série, OU — pour un cours de Tronc Commun — série listée dans les
"séries concernées" du cours)). Ce qui a changé avec cette mise à jour,
c'est le menu déroulant **côté prof** pour choisir le cours auquel
rattacher un support (`#supportCours`) : il ne liste plus que les cours que
le prof **gère réellement** (voir `coursGereParProf` ci-dessus), au lieu de
tous les cours de sa série.

**Non traité (hors demande) :** les **devoirs** restent liés à une seule
série (pas de notion de tronc commun, pas de notion de matière/prof
attribué) — dites-moi si vous voulez la même logique pour eux.

### Bug corrigé au passage

Le menu déroulant "Envoyer un Support de Cours" (`#supportCours`, page prof)
n'était rempli qu'une seule fois, **avant** que les cours n'aient fini de
charger depuis Firestore (chargement asynchrone) : il restait donc souvent
vide. Il est maintenant réactualisé à chaque mise à jour temps réel des
cours (`rafraichirVuesLieesAuxCours`), comme le sont déjà les autres menus
déroulants du même type.
