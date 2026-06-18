# 🌿 EcoRide — Application mobile de covoiturage écologique

EcoRide est une application mobile de covoiturage éco-responsable développée avec **React Native** et **Expo**. Elle permet de publier et réserver des trajets, suivre son bilan carbone et noter les conducteurs.

---

## Aperçu des fonctionnalités

- **Authentification** — Inscription, connexion, déconnexion
- **Trajets** — Publier un trajet, rechercher par ville, voir le détail
- **Réservations** — Réserver une place, voir ses réservations, gérer ses passagers
- **Profil** — Modifier ses infos, bilan carbone (km × 0.021 kg CO₂), notation conducteur

---

## Stack technique

| Technologie | Usage |
|---|---|
| React Native 0.81 | Framework mobile |
| Expo SDK 54 | Toolchain & runtime |
| Firebase Auth | Authentification |
| Cloud Firestore | Base de données |
| React Navigation 6 | Navigation entre écrans |

---

## Structure du projet

```
EcoRide/
├── App.js                        # Point d'entrée
├── app.json                      # Configuration Expo
├── firestore.rules               # Règles de sécurité Firebase
└── src/
    ├── theme.js                  # Couleurs, espacements, ombres
    ├── config/
    │   └── firebase.js           # Configuration Firebase
    ├── contexts/
    │   └── AuthContext.js        # Session utilisateur globale
    ├── navigation/
    │   ├── AppNavigator.js       # Routing auth ↔ app
    │   ├── AuthStack.js          # Stack Login / Register
    │   └── MainTabs.js           # Barre d'onglets
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   └── RegisterScreen.js
    │   ├── HomeScreen.js
    │   ├── SearchScreen.js
    │   ├── TripDetailScreen.js
    │   ├── PublishScreen.js
    │   ├── ReservationsScreen.js
    │   └── ProfileScreen.js
    ├── services/
    │   ├── authService.js        # Inscription / connexion / déconnexion
    │   ├── tripService.js        # CRUD trajets Firestore
    │   └── reservationService.js # CRUD réservations + notation
    └── components/
        ├── TripCard.js
        ├── ReservationCard.js
        └── StarRating.js
```

---

## Lancer le projet en local

### Prérequis

- [Node.js](https://nodejs.org) ≥ 18
- [Git](https://git-scm.com)
- [Expo Go](https://expo.dev/client) sur votre téléphone (Android / iOS) **ou** Android Studio pour l'émulateur

---

### 1. Cloner le dépôt

```bash
git clone https://github.com/lessing123/ecoride.git
cd ecoride
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Firebase

1. Créez un projet sur [Firebase Console](https://console.firebase.google.com)
2. Activez **Authentication → Email/Mot de passe**
3. Créez une base **Firestore** (mode Production)
4. Copiez votre config Web dans `src/config/firebase.js` :

```js
const firebaseConfig = {
  apiKey: 'VOTRE_API_KEY',
  authDomain: 'VOTRE_AUTH_DOMAIN',
  projectId: 'VOTRE_PROJECT_ID',
  storageBucket: 'VOTRE_STORAGE_BUCKET',
  messagingSenderId: 'VOTRE_SENDER_ID',
  appId: 'VOTRE_APP_ID',
};
```

5. Déployez les règles de sécurité : copiez le contenu de `firestore.rules` dans l'onglet **Règles** de Firestore

6. Créez l'index composite Firestore (requis pour la recherche) :
   - Collection : `trajets`
   - Champs : `departLower` (Asc) · `arriveLower` (Asc) · `statut` (Asc) · `placesDisponibles` (Asc) · `createdAt` (Desc)

---

### 4. Lancer l'application

```bash
npx expo start
```

| Touche | Action |
|---|---|
| `a` | Ouvrir sur émulateur Android |
| `i` | Ouvrir sur simulateur iOS (Mac uniquement) |
| `w` | Ouvrir dans le navigateur web |
| Scanner le QR | Ouvrir dans Expo Go sur votre téléphone |

---

### Tester dans le navigateur (sans téléphone ni émulateur)

```bash
npx expo start --web
```

L'app s'ouvre sur `http://localhost:8081`.

---

## Collections Firestore

| Collection | Champs principaux |
|---|---|
| `users` | uid, nom, prénom, email, noteMoyenne, kmTotal |
| `trajets` | conducteurId, depart, arrivee, date, heure, places, prix, statut |
| `reservations` | passagerId, trajetId, conducteurId, statut, note |

---

## Calcul du bilan carbone

```
CO₂ économisé (kg) = km parcourus × 0.021
```

Chaque kilomètre effectué en covoiturage au lieu de conduire seul économise **21 g de CO₂**.
