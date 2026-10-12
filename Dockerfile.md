# --- ÉTAPE 1 : Construction du Frontend Vue.js ---
FROM node:18-alpine AS build-frontend
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- ÉTAPE 2 : Environnement de Production (Node.js / Serveur Web) ---
FROM node:18-alpine AS production
WORKDIR /app

# Installation de curl pour les healthchecks
RUN apk add --no-cache curl

# Copie des dépendances et du build frontend/backend
COPY package*.json ./
RUN npm ci --only=production

COPY --from=build-frontend /app/dist ./dist
COPY . .

# Exposition du port de l'application
EXPOSE 3000

# Commande de lancement de l'application
CMD ["npm", "run", "start"]