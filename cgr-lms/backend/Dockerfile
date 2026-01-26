FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm install --only=production

# Copiar código fuente
COPY . .

# Crear directorio de logs
RUN mkdir -p logs

# Exponer puerto
EXPOSE 5000

# Usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Crear directorio de logs y asignar permisos
RUN mkdir -p logs && chown -R nodejs:nodejs /app

USER nodejs

# Comando de inicio
CMD ["node", "server.js"]
