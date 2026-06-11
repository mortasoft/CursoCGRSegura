FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Instalar dependencias del sistema y su-exec para cambio de usuario seguro
RUN apk add --no-cache su-exec

# Copiar código fuente
COPY . .

# Copiar script de entrada
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Exponer puerto
EXPOSE 5001

# Usuario no-root para seguridad (creado pero el cambio se hace en entrypoint.sh)
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Definir punto de entrada
ENTRYPOINT ["/app/entrypoint.sh"]

# Comando de inicio por defecto
CMD ["node", "server.js"]
