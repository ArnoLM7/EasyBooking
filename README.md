# EasyBooking

Application web de réservation de salles avec une architecture client-serveur moderne.

## Technologies

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| Node.js | - | Runtime JavaScript |
| Express | 5.2.1 | Framework HTTP |
| TypeScript | 5.9.3 | Typage statique |
| SQLite | better-sqlite3 | Base de données |
| JWT | jsonwebtoken | Authentification |
| bcryptjs | 3.0.3 | Hash des mots de passe |
| Jest | 30.2.0 | Tests unitaires/intégration |
| Playwright | 1.57.0 | Tests E2E |

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| React | 19.2.0 | Bibliothèque UI |
| Vite | 7.2.4 | Build tool |
| TypeScript | 5.9.3 | Typage statique |
| Tailwind CSS | 4.1.18 | Framework CSS |
| React Router | 7.12.0 | Routage |
| Axios | 1.13.2 | Client HTTP |

## Structure du projet

```
EasyBooking/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Logique métier
│   │   ├── models/           # Modèles de données
│   │   ├── routes/           # Routes API
│   │   ├── middlewares/      # Middlewares (auth)
│   │   ├── config/           # Configuration BD
│   │   └── types/            # Types TypeScript
│   ├── tests/
│   │   ├── unit/             # Tests unitaires
│   │   ├── integration/      # Tests d'intégration
│   │   └── e2e/              # Tests E2E
│   └── data/                 # Base de données SQLite
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages de l'application
│   │   ├── context/          # Context API (Auth)
│   │   ├── services/         # Services API
│   │   └── assets/           # Ressources statiques
│   └── public/               # Assets publics
│
└── README.md
```

## Prérequis

- Node.js >= 18.x
- npm >= 9.x

## Installation

### 1. Cloner le repository

```bash
git clone https://github.com/ArnoLM7/EasyBooking.git
cd EasyBooking
```

### 2. Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `backend/` :

```env
PORT=3001
JWT_SECRET=votre_clé_secrète_jwt
NODE_ENV=development
```

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `PORT` | Port du serveur backend | `3001` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | - |
| `NODE_ENV` | Environnement d'exécution | `development` |

**Frontend (optionnel)** : Créer un fichier `.env` dans `frontend/` :

```env
VITE_API_URL=http://localhost:3001/api
```

## Lancement

### Mode développement

```bash
# Terminal 1 - Backend (port 3001)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

L'application sera accessible sur : http://localhost:5173

### Mode production

```bash
# Build du frontend
cd frontend
npm run build

# Lancer le backend
cd ../backend
npm start
```

## API Endpoints

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register` | Inscription |
| POST | `/login` | Connexion |
| POST | `/logout` | Déconnexion |

### Salles (`/api/rooms`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/` | Liste des salles |
| GET | `/:id` | Détails d'une salle |
| GET | `/:id/availability` | Disponibilité d'une salle |

### Réservations (`/api/reservations`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/` | Créer une réservation | Oui |
| GET | `/me` | Mes réservations | Oui |
| DELETE | `/:id` | Annuler une réservation | Oui |

## Tests

### Lancer tous les tests

```bash
cd backend
npm test
```

### Tests unitaires

```bash
npm run test:unit
```

Tests des modèles et validations :
- Validation email/password
- Opérations utilisateur
- Opérations salles
- Opérations réservations

### Tests d'intégration

```bash
npm run test:integration
```

Tests des endpoints API avec Supertest.

### Tests E2E

```bash
npm run test:e2e
```

Tests du parcours utilisateur complet avec Playwright :
- Inscription / Connexion
- Navigation et filtres
- Réservation de salle
- Annulation de réservation
- Déconnexion

### Tests de performance

```bash
npm run perf
```

Tests de charge avec Artillery (10 clients, 20 secondes).

## Scripts disponibles

### Backend

| Script | Commande | Description |
|--------|----------|-------------|
| `dev` | `npm run dev` | Démarrage en mode dev |
| `test` | `npm test` | Tous les tests |
| `test:unit` | `npm run test:unit` | Tests unitaires |
| `test:integration` | `npm run test:integration` | Tests d'intégration |
| `test:e2e` | `npm run test:e2e` | Tests E2E |
| `perf` | `npm run perf` | Tests de performance |

### Frontend

| Script | Commande | Description |
|--------|----------|-------------|
| `dev` | `npm run dev` | Démarrage en mode dev |
| `build` | `npm run build` | Build de production |
| `preview` | `npm run preview` | Prévisualiser le build |
| `lint` | `npm run lint` | Vérification ESLint |

## Architecture

### Backend

```
Express.js → Routes → Controllers → Models → SQLite
                ↑
            Middleware (JWT Auth)
```

### Frontend

```
React → React Router → Pages → Components
              ↑
         AuthContext (Context API)
              ↑
         Axios + Interceptors → API
```

## Fonctionnalités

- Inscription et connexion sécurisées
- Liste des salles avec filtres (capacité, équipements)
- Calendrier interactif pour les réservations
- Vérification de disponibilité en temps réel
- Gestion des réservations (création, visualisation, annulation)
- Interface responsive avec Tailwind CSS
- Authentification JWT persistante

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'feat: ajout nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## Licence

MIT
