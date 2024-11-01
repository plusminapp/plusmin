# Stap 1: Bouwen van de app
FROM node:18-alpine AS builder

# Werkdirectory instellen
WORKDIR /app

# Dependencies installeren en build uitvoeren
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stap 2: Nginx gebruiken om de statische bestanden te serveren
FROM nginx:alpine

# Kopieer de statische bestanden van de build naar de Nginx public directory
RUN mkdir -p /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html
COPY /conf/nginx /etc/nginx

# Expose port 3030
EXPOSE 3030

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
