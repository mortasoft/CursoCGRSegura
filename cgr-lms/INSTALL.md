# 🚀 Guía de Instalación Rápida - CGR LMS

## Requisitos Previos

### Software Necesario
- ✅ Docker Desktop (v20.10+)
- ✅ Docker Compose (v2.0+)
- ✅ Git
- ✅ Cuenta de Google Cloud Platform

### Configuración de Google OAuth

1. **Ir a Google Cloud Console**
   - Visita: https://console.cloud.google.com/

2. **Crear un Proyecto Nuevo**
   - Nombre: "CGR LMS"
   - Organización: Tu organización

3. **Habilitar Google+ API**
   - APIs & Services → Library
   - Buscar "Google+ API"
   - Hacer clic en "Enable"

4. **Crear Credenciales OAuth 2.0**
   - APIs & Services → Credentials
   - Create Credentials → OAuth client ID
   - Application type: Web application
   - Name: "CGR LMS Web Client"
   
   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost
   ```
   
   **Authorized redirect URIs:**
   ```
   http://localhost:3000
   http://localhost:3000/login
   ```

5. **Copiar Credenciales**
   - Client ID: `123456789-abc.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxx`

## Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
cd /home/mortasoft/Github/CursoCGRSegura
cd cgr-lms
```

### 2. Configurar Variables de Entorno

#### Backend (.env)

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Editar y agregar tus credenciales:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu-client-secret

# Cambiar estos valores en producción
JWT_SECRET=cambiar_este_secreto_en_produccion_usar_valor_aleatorio_largo
SESSION_SECRET=cambiar_este_secreto_tambien_valor_aleatorio

# Base de datos (cambiar contraseñas en producción)
DB_PASSWORD=cgr_password_seguro_2026
REDIS_PASSWORD=cgr_redis_password_seguro_2026
```

#### Frontend (.env)

```bash
nano .env
```

Agregar:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

### 3. Iniciar el Sistema

#### Opción A: Usar el Script Automático (Recomendado)

```bash
./start.sh
```

#### Opción B: Manual

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 4. Verificar que Todo Funcione

```bash
# Verificar servicios
docker-compose ps

# Debería mostrar:
# cgr-lms-mariadb    (healthy)
# cgr-lms-redis      (healthy)
# cgr-lms-backend    (running)
# cgr-lms-frontend   (running)
```

### 5. Acceder al Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

### 6. Primer Login

1. Ir a http://localhost:3000
2. Hacer clic en "Sign in with Google"
3. Usar una cuenta de prueba con dominio @cgr.go.cr

**Nota**: Para desarrollo, puedes modificar temporalmente la validación del dominio en `backend/routes/auth.js` línea 25.

## Comandos Útiles

### Ver Logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f mariadb
```

### Reiniciar Servicios

```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo backend
docker-compose restart backend
```

### Detener el Sistema

```bash
# Detener servicios (mantiene datos)
docker-compose stop

# Detener y eliminar contenedores (mantiene volúmenes)
docker-compose down

# Eliminar TODO (incluyendo base de datos)
docker-compose down -v
```

### Acceder a la Base de Datos

```bash
# Conectar a MariaDB
docker-compose exec mariadb mysql -u cgr_user -p cgr_lms

# Contraseña: cgr_password_2026
```

### Acceder a Redis

```bash
# Conectar a Redis CLI
docker-compose exec redis redis-cli -a cgr_redis_password_2026

# Ver todas las claves
KEYS *

# Ver sesiones
KEYS sess:*
```

## Solución de Problemas

### Error: "Port already in use"

```bash
# Ver qué está usando el puerto
sudo lsof -i :3000
sudo lsof -i :5000

# Matar el proceso
kill -9 <PID>
```

### Error: "Cannot connect to database"

```bash
# Verificar que MariaDB esté corriendo
docker-compose ps mariadb

# Ver logs de MariaDB
docker-compose logs mariadb

# Reiniciar MariaDB
docker-compose restart mariadb
```

### Error: "Google OAuth failed"

1. Verificar que `GOOGLE_CLIENT_ID` sea correcto en ambos `.env`
2. Verificar que las URLs de redirección estén configuradas en Google Cloud
3. Verificar que Google+ API esté habilitada

### Resetear Base de Datos

```bash
# Detener servicios
docker-compose down

# Eliminar volumen de base de datos
docker volume rm cgr-lms_mariadb_data

# Iniciar de nuevo (creará DB desde cero)
docker-compose up -d
```

## Desarrollo Local

### Modo Desarrollo (sin Docker)

#### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

#### Frontend

```bash
npm install
# Crear .env con VITE_API_URL y VITE_GOOGLE_CLIENT_ID
npm run dev
```

### Hot Reload

El sistema está configurado con hot reload:
- Frontend: Vite HMR (cambios instantáneos)
- Backend: Nodemon (reinicio automático)

## Próximos Pasos

1. ✅ Verificar que el login funcione
2. ✅ Explorar el dashboard
3. ✅ Revisar los módulos del curso
4. 📝 Agregar contenido a los módulos
5. 📝 Configurar simulacros de phishing
6. 📝 Personalizar certificados

## Soporte

Para problemas o preguntas:
- 📧 Email: soporte@cgr.go.cr
- 📚 Documentación: Ver README.md
- 🐛 Reportar bugs: Crear issue en el repositorio

---

**¡Listo para empezar! 🎉**
