#!/bin/bash

echo "🚀 Iniciando CGR LMS - Learning Management System"
echo "=================================================="
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado"
    echo "Por favor instala Docker desde: https://docs.docker.com/get-docker/"
    exit 1
fi

# Usar docker compose (versión moderna) en lugar de docker-compose
DOCKER_COMPOSE="docker compose"

# Verificar si docker compose funciona
if ! docker compose version &> /dev/null; then
    # Intentar con docker-compose legacy
    if command -v docker-compose &> /dev/null; then
        DOCKER_COMPOSE="docker-compose"
    else
        echo "❌ Error: Docker Compose no está disponible"
        echo "Por favor instala Docker Compose desde: https://docs.docker.com/compose/install/"
        exit 1
    fi
fi

echo "✅ Usando: $DOCKER_COMPOSE"

# Verificar si existe el archivo .env principal
if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: No se encontró .env en la raíz"
    echo "📝 Creando archivo .env desde .env.example..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
    echo ""
    echo "⚠️  IMPORTANTE: Debes editar el archivo .env con tus credenciales reales:"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - DB_PASSWORD"
    echo "   - REDIS_PASSWORD"
    echo ""
    read -p "Presiona Enter cuando hayas configurado las credenciales..."
fi

# Crear directorio de logs si no existe (para evitar problemas de permisos)
mkdir -p backend/logs
chmod 777 backend/logs

echo "🐳 Deteniendo contenedores existentes..."
$DOCKER_COMPOSE down

echo ""
echo "🔨 Construyendo imágenes Docker..."
$DOCKER_COMPOSE build

echo ""
echo "🚀 Iniciando servicios..."
$DOCKER_COMPOSE up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo ""
echo "✅ Verificando estado de los servicios..."
$DOCKER_COMPOSE ps

echo ""
echo "🎉 ¡CGR LMS está corriendo!"
echo ""
echo "📍 URLs de acceso:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:5000"
echo "   Health Check: http://localhost:5000/health"
echo ""
echo "📊 Base de datos:"
echo "   MariaDB:     localhost:3306"
echo "   Redis:       localhost:6379"
echo ""
echo "📝 Para ver los logs:"
echo "   $DOCKER_COMPOSE logs -f"
echo ""
echo "🛑 Para detener el sistema:"
echo "   $DOCKER_COMPOSE down"
echo ""
echo "=================================================="
