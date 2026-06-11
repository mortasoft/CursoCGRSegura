#!/bin/sh
set -e

# Asegurar que los directorios necesarios existan
mkdir -p /app/uploads/course_content
mkdir -p /app/uploads/resources
mkdir -p /app/logs

# Cambiar la propiedad de los directorios montados al usuario nodejs (UID 1001)
# Esto resuelve problemas de permisos cuando se usan bind mounts en Linux
chown -R nodejs:nodejs /app/uploads
chown -R nodejs:nodejs /app/logs

# Ejecutar el comando pasado como argumentos (usualmente 'node server.js')
# como el usuario nodejs
exec su-exec nodejs "$@"
