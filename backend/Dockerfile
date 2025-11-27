# ==========================
# 1️⃣ BUILD FRONTEND
# ==========================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend .
RUN npm run build


# ==========================
# 2️⃣ DENO SERVER
# ==========================
FROM denoland/deno:alpine

WORKDIR /app

# copiar backend
COPY backend .

# copiar frontend compilado
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "app.ts"]
