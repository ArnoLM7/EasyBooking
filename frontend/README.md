# EasyBooking - Frontend

Application web de réservation de salles construite avec React, TypeScript, Vite et Tailwind CSS.

## 🚀 Technologies utilisées

- **React 19** avec TypeScript
- **Vite** pour le build et le développement
- **React Router** pour la navigation
- **Axios** pour les appels API
- **Tailwind CSS** pour le styling
- **Context API** pour la gestion d'état (authentification)

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

Créez un fichier `.env` à la racine du dossier `frontend` (optionnel) :

```env
VITE_API_URL=http://localhost:3001/api
```

Si vous ne créez pas ce fichier, l'application utilisera `http://localhost:3001/api` par défaut.

## 🏃 Démarrage

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Build pour production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

### Prévisualisation du build

```bash
npm run preview
```

## 🗂️ Structure du projet

```
frontend/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Navbar.tsx       # Barre de navigation
│   │   ├── ProtectedRoute.tsx  # Protection des routes authentifiées
│   │   └── BookingModal.tsx # Modal de réservation
│   ├── context/             # Contextes React
│   │   └── AuthContext.tsx  # Gestion de l'authentification
│   ├── pages/               # Pages de l'application
│   │   ├── DashboardPage.tsx      # Page d'accueil
│   │   ├── LoginPage.tsx          # Connexion
│   │   ├── RegisterPage.tsx       # Inscription
│   │   ├── RoomsPage.tsx          # Liste des salles + filtres
│   │   └── MyReservationsPage.tsx # Mes réservations
│   ├── services/            # Services API
│   │   └── api.ts           # Configuration Axios + endpoints
│   ├── types.ts             # Types TypeScript
│   ├── App.tsx              # Composant racine + routing
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── public/                  # Assets statiques
├── .env.example            # Exemple de configuration
└── package.json
```

## 🔐 Fonctionnalités

### Authentification
- **Inscription** : Création de compte avec nom, email et mot de passe
- **Connexion** : Authentification par email/mot de passe avec JWT
- **Session persistante** : Token stocké dans localStorage
- **Déconnexion** : Suppression du token et redirection

### Gestion des salles
- **Liste des salles** : Affichage de toutes les salles disponibles
- **Filtres** :
  - Par capacité minimale
  - Par équipements (recherche textuelle)
- **Détails** : Nom, capacité, équipements

### Réservations
- **Création de réservation** :
  - Sélection de date et créneaux horaires
  - Vérification automatique de disponibilité
  - Confirmation en temps réel
- **Mes réservations** :
  - Liste de toutes mes réservations
  - Distinction réservations passées/futures
  - Annulation possible (seulement pour les réservations futures)

## 🔗 API Backend

L'application communique avec le backend via les endpoints suivants :

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Salles
- `GET /api/rooms` - Liste des salles
- `GET /api/rooms/:id` - Détails d'une salle
- `GET /api/rooms/:id/availability?startTime=...&endTime=...` - Vérifier disponibilité

### Réservations (authentification requise)
- `POST /api/reservations` - Créer une réservation
- `GET /api/reservations/me` - Mes réservations
- `DELETE /api/reservations/:id` - Annuler une réservation

## 🎨 Design

L'interface utilise Tailwind CSS avec :
- Palette de couleurs moderne (bleu primary)
- Design responsive (mobile-first)
- Animations et transitions fluides
- Composants accessibles

## 🛡️ Sécurité

- Authentification par JWT (Bearer token)
- Token stocké en localStorage
- Routes protégées avec `ProtectedRoute`
- Validation côté client et serveur
- Headers Authorization automatiques via intercepteurs Axios

## 📝 Prochaines étapes (Tests)

- Tests unitaires avec Vitest
- Tests d'intégration avec React Testing Library
- Tests E2E
- Plan de test complet

## 👥 Contributeurs

Projet réalisé dans le cadre de la mission EasyBooking.
