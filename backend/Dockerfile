# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Copier le fichier .env.docker comme .env
COPY .env.docker .env

# Exposer le port
EXPOSE 5000

# Commande de démarrage
CMD ["npm", "run", "dev"]
