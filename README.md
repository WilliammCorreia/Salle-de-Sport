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