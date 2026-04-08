#!/bin/bash

# ==============================================================================
# SCRIPT DE RESTAURACION - CGR SEGURA (MariaDB Docker)
# ==============================================================================

# 1. Configuracion
BACKUP_PATH="./backups"
CONTAINER_NAME="cgr-lms-mariadb"

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
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASSWORD}

if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASS" ]; then
    echo "ERROR: Faltan variables de base de datos en el archivo .env (DB_NAME, DB_USER, DB_PASSWORD)"
    exit 1
fi

echo "------------------------------------------------------------"
echo "Iniciando proceso de restauracion..."

# 3. Buscar el respaldo mas reciente (.sql)
LATEST_BACKUP=$(ls -t $BACKUP_PATH/*_respaldo_${DB_NAME}_*.sql 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "ERROR: No se encontro ningun archivo de respaldo .sql en $BACKUP_PATH"
    echo "------------------------------------------------------------"
    exit 1
fi

echo "Archivo detectado: $LATEST_BACKUP"

# 4. Restaurar el archivo SQL
echo "Iniciando restauracion..."
docker exec -i $CONTAINER_NAME mariadb -u $DB_USER -p$DB_PASS $DB_NAME < "$LATEST_BACKUP"

# 5. Verificar resultado
if [ $? -eq 0 ]; then
    echo "Restauracion completada exitosamente."
else
    echo "ERROR: Ocurrio un problema durante la restauracion."
    exit 1
fi

echo "------------------------------------------------------------"
