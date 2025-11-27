FROM denoland/deno:alpine

# Instalar Node.js para construir el frontend
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copiar todo el proyecto
COPY . .

# Construir frontend
WORKDIR /app/frontend
RUN npm install
RUN npm run build

# Volver al backend
WORKDIR /app/backend

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "app.ts"]
