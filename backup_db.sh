#!/bin/bash

# ==============================================================================
# SCRIPT DE RESPALDO - CGR SEGUR@ (MariaDB Docker)
# ==============================================================================

# 1. Configuración (Se puede ajustar según necesidad)
BACKUP_PATH="./backups"
CONTAINER_NAME="cgr-lms-mariadb"
MAX_BACKUPS=30

# Crear carpeta de respaldos si no existe
mkdir -p $BACKUP_PATH

# 2. Cargar variables desde el archivo .env si existe
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Variables de la BD (deben estar en .env)
DB_NAME=${DB_NAME:-cgr_lms}
DB_USER="root"
DB_PASS=${MYSQL_ROOT_PASSWORD}

if [ -z "$DB_NAME" ] || [ -z "$DB_PASS" ]; then
    echo "ERROR: Faltan variables de base de datos en el archivo .env (DB_NAME, MYSQL_ROOT_PASSWORD)"
    exit 1
fi
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="respaldo_${DB_NAME}_${TIMESTAMP}.sql"

echo "------------------------------------------------------------"
echo "Iniciando respaldo de base de datos: $DB_NAME"

# 3. Ejecutar mariadb-dump dentro del contenedor
docker exec $CONTAINER_NAME mariadb-dump -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > $BACKUP_PATH/$FILENAME

# 4. Verificar si el comando fue exitoso
if [ $? -eq 0 ]; then
    echo "Respaldo exitoso: $BACKUP_PATH/$FILENAME"
else
    echo "ERROR: No se pudo realizar el respaldo."
    exit 1
fi

# 5. Limpieza (Mantiene solo los últimos $MAX_BACKUPS)
echo "Limpiando respaldos antiguos (manteniendo los últimos $MAX_BACKUPS)..."
ls -t $BACKUP_PATH/respaldo_${DB_NAME}_*.sql | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm

echo "Proceso finalizado."
echo "------------------------------------------------------------"
