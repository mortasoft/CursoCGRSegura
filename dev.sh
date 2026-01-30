#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando entorno de desarrollo local CGR LMS...${NC}"
echo "=================================================="

# 0. Limpieza agresiva de entornos anteriores
echo -e "${YELLOW}🧹 Limpiando procesos y puertos anteriores...${NC}"

# Matar procesos en puertos específicos
if command -v fuser &> /dev/null; then
    fuser -k 5000/tcp 2>/dev/null
    fuser -k 3000/tcp 2>/dev/null
    fuser -k 3001/tcp 2>/dev/null
fi

# Matar procesos por nombre (más agresivo pero seguro para este contexto de dev)
pkill -f "nodemon" 2>/dev/null
pkill -f "vite" 2>/dev/null
# Solo matar node si está ejecutando nuestros scripts específicos para no matar otras cosas del usuario
pkill -f "node server.js" 2>/dev/null

# Detener contenedores frontend/backend si estuvieran corriendo
docker compose stop frontend backend nginx 2>/dev/null

echo -e "${GREEN}✨ Limpieza completada.${NC}"
echo ""

# Función para limpieza al salir (Ctrl+C)
cleanup() {
    echo ""
    echo -e "${RED}🛑 Deteniendo servicios...${NC}"
    # Matar procesos hijos
    kill $(jobs -p) 2>/dev/null
    # Asegurar que procesos node mueran
    pkill -P $$ 2>/dev/null
    # Detener infraestructura docker
    docker compose stop mariadb redis
    echo -e "${GREEN}✅ Todo detenido correctamente.${NC}"
    exit
}

# Configurar trap para Ctrl+C
trap cleanup SIGINT SIGTERM

# 1. Iniciar infraestructura (BD y Redis)
echo -e "${BLUE}🐳 Iniciando MariaDB y Redis en Docker...${NC}"
docker compose up -d mariadb redis

# Esperar a que la DB esté lista
echo "⏳ Esperando a que la base de datos esté lista..."
until docker compose exec mariadb mariadb-admin ping -h localhost --silent; do
    echo -n "."
    sleep 2
done
echo ""
echo -e "${GREEN}✅ Base de datos lista.${NC}"

# 2. Configurar y arrancar Backend
echo -e "${BLUE}🔧 Iniciando Backend (Puerto 5000)...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    npm install
fi

# Variables para conexión local explicitas
export DB_HOST=localhost
export REDIS_HOST=localhost
export NODE_ENV=development

# Correr en background
npm run dev &
BACKEND_PID=$!
cd ..

# 3. Configurar y arrancar Frontend
echo -e "${BLUE}✨ Iniciando Frontend (Puerto 3000)...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install --legacy-peer-deps
fi

# Correr en background (pero manteniendo output visible al final)
echo -e "${GREEN}✅ Entorno de desarrollo activo.${NC}"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:5000"
echo "   (Presiona Ctrl+C para detener todo)"
echo ""

npm run dev

# Esperar a que termine el frontend
wait $BACKEND_PID
cleanup
