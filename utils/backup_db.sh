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
ENV_FILE=""
if [ -f .env ]; then ENV_FILE=".env"; elif [ -f ../.env ]; then ENV_FILE="../.env"; fi

if [ -n "$ENV_FILE" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        [[ "$line" =~ ^#.*$ ]] && continue
        [[ -z "$line" ]] && continue
        if [[ "$line" =~ ^[a-zA-Z_][a-zA-Z0-9_]*=.*$ ]]; then
            export "$line"
        fi
    done < "$ENV_FILE"
fi

# Variables de la BD (deben estar en .env)
DB_NAME=${DB_NAME:-cgr_lms}
DB_USER="root"
DB_PASS=${MYSQL_ROOT_PASSWORD}

if [ -z "$DB_NAME" ] || [ -z "$DB_PASS" ]; then
    echo "ERROR: Faltan variables de base de datos en el archivo .env (DB_NAME, MYSQL_ROOT_PASSWORD)"
    exit 1
fi
# 3. Calcular Correlativo
NEXT_NUMBER=1
LAST_BACKUP=$(ls -1 $BACKUP_PATH 2>/dev/null | grep '^[0-9]\{4\}_respaldo_.*\.sql$' | sort -V | tail -n 1)
if [ -n "$LAST_BACKUP" ]; then
    LAST_NUMBER=$(echo $LAST_BACKUP | cut -d'_' -f1)
    NEXT_NUMBER=$((10#$LAST_NUMBER + 1))
fi
PREFIX=$(printf "%04d" $NEXT_NUMBER)

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="${PREFIX}_respaldo_${DB_NAME}_${TIMESTAMP}.sql"

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

# 5. Respaldar carpeta de uploads
UPLOADS_PATH=""
if [ -d "../uploads" ]; then
    UPLOADS_PATH="../uploads"
elif [ -d "uploads" ]; then
    UPLOADS_PATH="uploads"
fi

if [ -n "$UPLOADS_PATH" ]; then
    echo "Respaldando carpeta de uploads..."
    UPLOADS_FILENAME="${PREFIX}_respaldo_uploads_${TIMESTAMP}.tar.gz"
    tar -czf "$BACKUP_PATH/$UPLOADS_FILENAME" "$UPLOADS_PATH"
    echo "Respaldo de uploads completado: $BACKUP_PATH/$UPLOADS_FILENAME"
fi

# 6. Limpieza (Mantiene solo los últimos $MAX_BACKUPS)
echo "Limpiando respaldos antiguos (manteniendo los últimos $MAX_BACKUPS)..."
ls -t $BACKUP_PATH/[0-9][0-9][0-9][0-9]_respaldo_${DB_NAME}_*.sql 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
ls -t $BACKUP_PATH/[0-9][0-9][0-9][0-9]_respaldo_uploads_*.tar.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm

echo "Proceso finalizado."
echo "------------------------------------------------------------"
