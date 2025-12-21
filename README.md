# TSPark - Gestion de Salle de Sport

## Installation

### Prérequis

- Docker
- Docker Compose

### Lancer l'application avec Docker

```bash
docker-compose up -d
```

Cette commande va démarrer automatiquement :

- MongoDB (port 27017)
- Backend API (port 5000)
- Frontend Angular (port 4200)

### Créer les comptes de test

```bash
docker-compose exec backend npm run seed
```

## Comptes de test

| Email           | Mot de passe | Rôle        |
| --------------- | ------------ | ----------- |
| user@user.com   | password123  | client      |
| admin@admin.com | password123  | super_admin |
| owner@owner.com | password123  | gym_owner   |

## Routes API

### Authentification

- **POST** `/api/auth/register` - Route pour l'inscription
- **POST** `/api/auth/login` - Route pour la connexion
- **GET** `/api/auth/me` - Route pour obtenir les informations de l'utilisateur connecté
- **PUT** `/api/auth/update-password` - Route pour changer le mot de passe

### Utilisateurs

- **GET** `/api/users` - Route pour obtenir la liste de tous les utilisateurs
- **GET** `/api/users/:id` - Route pour obtenir un utilisateur par son ID
- **PUT** `/api/users/:id` - Route pour mettre à jour un utilisateur
- **DELETE** `/api/users/:id` - Route pour supprimer un utilisateur
- **PUT** `/api/users/:id/deactivate` - Route pour désactiver un utilisateur
- **PUT** `/api/users/:id/activate` - Route pour activer un utilisateur
- **PUT** `/api/users/:id/role` - Route pour changer le rôle d'un utilisateur
- **GET** `/api/users/:id/stats` - Route pour obtenir les statistiques d'un utilisateur

### Salles de sport

- **GET** `/api/gym-halls` - Route pour obtenir la liste de toutes les salles de sport
- **GET** `/api/gym-halls/:id` - Route pour obtenir une salle de sport par son ID
- **POST** `/api/gym-halls` - Route pour créer une nouvelle salle de sport
- **PUT** `/api/gym-halls/:id` - Route pour mettre à jour une salle de sport
- **DELETE** `/api/gym-halls/:id` - Route pour supprimer une salle de sport
- **PUT** `/api/gym-halls/:id/approve` - Route pour approuver une salle de sport
- **PUT** `/api/gym-halls/:id/reject` - Route pour rejeter une salle de sport
- **PUT** `/api/gym-halls/:id/suspend` - Route pour suspendre une salle de sport

### Types d'Exercices
- **GET** `/api/exercices-types` - Route pour obtenir la liste de tous les types d'exercices : utilisateur authentifié.
- **GET** `/api/exercices-types/:id` - Récupérer un type d'exercice par ID. Accès : utilisateur authentifié.
- **POST** `/api/exercices-types` - Créer un nouveau type d'exercice. Accès : super_admin. Body attendu (JSON) :
  - name (string, requis)
  - description (string, requis)
  - muscleGroups (array de strings, au moins 1 élément)
- **PUT** `/api/exercices-types/:id` - Mettre à jour un type d'exercice par ID. Accès : super_admin. Même body que pour la création.
- **DELETE** `/api/exercices-types/:id` - Supprimer un type d'exercice par ID. Accès : super_admin.

### Défis
- **GET** `/api/challenges` - Récupérer tous les défis. Accès : utilisateurs authentifiés. Query params optionnels :
  - `difficulty` : `débutant`, `intermédiaire`, `avancé`, `expert`
  - `minDuration` / `maxDuration` : filtrer par durée
  - `exercicesTypes` : array d'IDs de types d'exercices
  - `gymHall` : ID d'une salle de sport
- **GET** `/api/challenges/:id` - Récupérer un défi par ID. Accès : utilisateurs authentifiés.
- **POST** `/api/challenges` - Créer un nouveau défi. Accès : utilisateurs authentifiés (protect). Body (JSON) attendu :
  - title (string, requis)
  - description (string, requis)
  - creator (ObjectId string, requis)
  - category (string, requis) : one of `perte_poids`, `prise_masse`, `endurance`, `force`, `souplesse`, `autre`
  - duration (int, requis, >= 1)
  - exercises (array, requis, min 1) — chaque élément :
    - exerciseType (ObjectId, requis)
    - sets (int, optionnel)
    - reps (int, optionnel)
    - restTime (int, optionnel, secondes)
  - options : gymHall (ObjectId), equipment (array de strings), difficulty (`débutant`|`intermédiaire`|`avancé`|`expert`), durationUnit (`jours`|`semaines`), participants (array d'ObjectId), isActive (boolean)
- **PUT** `/api/challenges/:id` - Mettre à jour un défi par ID. Accès : créateur du défi ou `super_admin`. Même body que pour la création.
- **DELETE** `/api/challenges/:id` - Supprimer un défi par ID. Accès : créateur du défi ou `super_admin`.
- **POST** `/api/challenges/:id/join` - Rejoindre un défi par ID. Accès : utilisateurs authentifiés.
- **POST** `/api/challenges/:id/invite` - Inviter un utilisateur à un défi. Accès : utilisateurs authentifiés. Body : `email` (string, requis)

### Invitations aux Défis
- **GET** `/api/users/me/invitations` - Récupérer mes invitations en attente. Accès : utilisateurs authentifiés.
- **PUT** `/api/invitations/:id/respond` - Accepter/Refuser une invitation. Accès : destinataire. Body : `status` (`accepted` | `refused`)

### Badges
- **GET** `/api/badges` - Récupérer tous les badges. Accès : public.
- **GET** `/api/badges/:id` - Récupérer un badge par ID. Accès : public.
- **GET** `/api/badges/:id/users` - Récupérer la liste des utilisateurs ayant obtenu ce badge. Accès : public.
- **POST** `/api/badges` - Créer un nouveau badge. Accès : super_admin. Body (JSON) attendu :
  - name (string, requis)
  - description (string, requis)
  - icon (string, optionnel)
  - criteria (object, requis)
- **PUT** `/api/badges/:id` - Mettre à jour un badge par ID. Accès : super_admin. Même body que pour la création.
- **DELETE** `/api/badges/:id` - Supprimer un badge par ID. Accès : super_admin.
- **POST** `/api/badges/:id/award/:userId` - Attribuer un badge à un utilisateur. Accès : super_admin.

### Leaderboard (Classements)
- **GET** `/api/leaderboard/users` - Récupérer le classement général des utilisateurs. Accès : public.
- **GET** `/api/leaderboard/gyms` - Récupérer le classement des salles de sport. Accès : public.
- **GET** `/api/leaderboard/challenges/:id` - Récupérer le classement d'un défi spécifique. Accès : public.
- **GET** `/api/leaderboard/challenges-completed` - Récupérer le classement des utilisateurs par nombre de défis complétés. Accès : public.
- **GET** `/api/leaderboard/badges` - Récupérer le classement des utilisateurs par nombre de badges obtenus. Accès : public.

### Progression
- **GET** `/api/progress/my-challenges` - Obtenir tous les défis en cours de l'utilisateur connecté. Accès : utilisateurs authentifiés.

### Workouts (Entraînements)
- **GET** `/api/workouts` - Récupérer tous les entraînements de l'utilisateur connecté. Accès : utilisateurs authentifiés.
- **GET** `/api/workouts/:id` - Récupérer un entraînement par ID. Accès : utilisateurs authentifiés.
- **POST** `/api/workouts` - Créer un nouveau entraînement. Accès : utilisateurs authentifiés. Body (JSON) attendu :
  - user (ObjectId, requis)
  - exercises (array, requis)
  - duration (number, requis)
  - caloriesBurned (number, optionnel)
  - notes (string, optionnel)
- **PUT** `/api/workouts/:id` - Mettre à jour un entraînement par ID. Accès : utilisateurs authentifiés. Même body que pour la création.
- **DELETE** `/api/workouts/:id` - Supprimer un entraînement par ID. Accès : utilisateurs authentifiés.
- **GET** `/api/workouts/stats/summary` - Obtenir les statistiques d'entraînement de l'utilisateur connecté. Accès : utilisateurs authentifiés.

## Structure du Projet

### Backend

#### Routes
Tous les fichiers de routes se trouvent dans : **`backend/src/routes/`**

- `auth.routes.js` - Routes d'authentification
- `user.routes.js` - Routes de gestion des utilisateurs
- `gymHall.routes.js` - Routes de gestion des salles de sport
- `exercice.routes.js` - Routes de gestion des types d'exercices
- `challenge.routes.js` - Routes de gestion des défis
- `challengeInvitation.routes.js` - Routes de gestion des invitations aux défis
- `badge.routes.js` - Routes de gestion des badges
- `leaderboard.routes.js` - Routes des classements
- `progress.routes.js` - Routes de suivi de progression
- `workout.routes.js` - Routes de gestion des entraînements

#### Controllers
Tous les fichiers de controllers se trouvent dans : **`backend/src/controllers/`**

- `auth.controller.js` - Logique d'authentification
- `user.controller.js` - Logique de gestion des utilisateurs
- `gymHall.controller.js` - Logique de gestion des salles de sport
- `exercicesTypes.controller.js` - Logique de gestion des types d'exercices
- `challenge.controller.js` - Logique de gestion des défis
- `challengeInvitation.controller.js` - Logique de gestion des invitations aux défis
- `badge.controller.js` - Logique de gestion des badges
- `leaderboard.controller.js` - Logique des classements
- `challengeProgress.controller.js` - Logique de suivi de progression
- `workout.controller.js` - Logique de gestion des entraînements

#### Models
Tous les fichiers de models se trouvent dans : **`backend/src/models/`**

- `User.model.js` - Modèle utilisateur
- `GymHall.model.js` - Modèle salle de sport
- `ExercicesTypes.model.js` - Modèle type d'exercice
- `Challenge.model.js` - Modèle défi
- `ChallengeInvitation.model.js` - Modèle invitation à un défi
- `Badge.model.js` - Modèle badge
- `ChallengeProgress.model.js` - Modèle progression de défi
- `Workout.model.js` - Modèle entraînement
