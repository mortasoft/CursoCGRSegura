# CGR LMS - Learning Management System
## Sistema de Gestión de Aprendizaje para CGR Segur@

### 🏗️ Arquitectura del Sistema

#### **Stack Tecnológico**
- **Frontend**: React 19 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Base de Datos**: MariaDB 11.2
- **Cache**: Redis 7.2
- **Email Service**: Nodemailer + SMTP (Gmail TLS)
- **Procesamiento de Imágenes**: CairoSVG (Conversión SVG a PNG de alta fidelidad)
- **Autenticación**: Google OAuth 2.0
- **Containerización**: Docker + Docker Compose
- **Reverse Proxy**: Nginx

### 📊 Capacidad del Sistema
- ✅ Soporta **700 funcionarios** concurrentes
- ✅ Pool de conexiones optimizado (50 conexiones simultáneas)
- ✅ Cache Redis para sesiones y datos frecuentes
- ✅ Rate limiting (100 requests/15min por IP)

### 🔐 Seguridad Implementada

#### **Autenticación**
- Login exclusivo con Google OAuth (@cgr.go.cr)
- Tokens JWT con expiración de 24 horas
- Sesiones almacenadas en Redis
- Verificación automática de dominio institucional

#### **Protección**
- Helmet.js para headers de seguridad
- CORS configurado para dominios institucionales
- Rate limiting preventivo
- Validación de inputs con Express Validator
- SQL injection prevention (prepared statements)
- Protección XSS y CSRF

### 📚 Funcionalidades del LMS

#### **Para Estudiantes (Funcionarios)**
1. **Dashboard Personal**
   - Progreso general y módulos completados
   - Sistema de gamificación con puntos y niveles
2. **Módulos de Aprendizaje**
   - 8 módulos temáticos con lecciones interactivas y videos
3. **Insignias y Logros**
   - **Notificaciones por Email**: Recepción de correos premium al ganar insignias
   - Formato de imagen de alta fidelidad (PNG con fallback SVG)
4. **Certificación**
   - Emisión de certificados digitales únicos al finalizar el curso

#### **Para Administradores**
1. **Alertas de Riesgo**
   - Identificación de funcionarios con avance crítico (<20%)
   - **Envío Masivo de Invitaciones**: Funcionalidad para invitar por área a funcionarios que aún no han ingresado a la plataforma.
2. **Gestión de Insignias**
   - Asignación manual de logros con notificación inmediata por correo.
3. **Reportes y Analíticas**
   - Tendencias de cumplimiento y estadísticas por departamento en tiempo real.

### 📧 Sistema de Notificaciones
El sistema incluye un servicio de correo electrónico robusto configurado en `backend/services/emailService.js`.

- **Diseño Premium**: Plantillas HTML con tema oscuro, logos institucionales embebidos (CIDs) y diseño responsive.
- **Seguridad**: Autenticación mediante TLS (puerto 587) y Contraseñas de Aplicación de Google.
- **Fidelidad Visual**: Las insignias se convierten automáticamente de SVG a PNG en el servidor para garantizar visibilidad en todos los clientes de correo (Gmail, Outlook, iOS).

### 🚀 Configuración y Despliegue

#### **Variables de Entorno (.env)**
El proyecto usa un solo archivo de entorno en la raíz del repositorio. Copia el ejemplo y actualiza los valores antes de ejecutar la aplicación.

```bash
cp .env.example .env
```

El archivo `.env` se utiliza tanto para el backend como para el frontend local, porque `backend/server.js` carga `../.env` y `frontend/vite.config.js` usa `envDir: '../'`.

Ejemplo parcial para correo y Google OAuth:

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=cgr_user
DB_PASSWORD=secret_db_password
DB_NAME=cgr_lms
REDIS_HOST=localhost
REDIS_PORT=6379
SESSION_SECRET=super_secret_session_key
JWT_SECRET=super_secret_jwt_key
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu.usuario@cgr.go.cr
EMAIL_PASSWORD=your-email-password
EMAIL_FROM="Seguridad de la Información <seguridad.informacion@cgr.go.cr>"
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_ALLOWED_HOSTS=localhost,127.0.0.1
```

> Importante: No subas el archivo `.env` al repositorio. Solo comparte el `.env.example`.

#### **Levantar el entorno en desarrollo**
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

#### **Levantar con Docker Compose**
```bash
docker-compose up -d --build
```

#### **Verificar estado**
```bash
docker ps
```

### 🛠️ Herramientas de Mantenimiento

#### **Scripts de Prueba de Email**
Ubicados en `backend/scratch/`, permiten validar el diseño de los correos sin afectar a usuarios reales:

```powershell
# Probar email de invitación
docker exec cgrsegura-backend node /app/scratch/test_invitation.js

# Probar email de insignia
docker exec cgrsegura-backend node /app/scratch/test_badge_email.js
```

#### **Conversión de Insignias**
Si se agregan nuevas insignias en SVG, se deben procesar para generar sus versiones PNG:
```powershell
docker exec cgrsegura-backend python3 /app/convert_high_quality.py
```

### 🔄 Sincronización con Repositorio Padre

Para mantener este repositorio (`mia`) actualizado con las mejoras del repositorio original sin enviar tus cambios locales al padre, sigue estos pasos:

#### **Comandos de Sincronización**
```powershell
# 1. Asegurarte de estar en la rama principal
git checkout main

# 2. Descargar actualizaciones del repositorio original
git fetch upstream

# 3. Fusionar los cambios en tu código local
git merge upstream/main

# 4. (Opcional) Subir los cambios a TU repositorio en GitHub (mia)
git push origin main
```

#### **Conceptos Clave**
- **`origin`**: Tu repositorio personal (`mia`). Es donde debes subir tus cambios.
- **`upstream`**: El repositorio original de la CGR. Solo se usa para descargar actualizaciones.
- **Conflictos**: Si al hacer el `merge` aparecen conflictos, deberás resolverlos manualmente en el editor antes de hacer el commit final.

### 💾 Backup y Recuperación

#### **Respaldo de Base de Datos**
```powershell
docker exec cgrsegura-mariadb mariadb-dump -u cgr_user -pcgr_password_2026 cgr_lms > backup_$(Get-Date -Format "yyyyMMdd").sql
```

#### **Limpieza de Cache**
```powershell
docker exec cgrsegura-redis redis-cli FLUSHALL
```

### 🎨 Identidad Visual
- **Tema**: Dark Mode Institucional
- **Colores**: Blanco (#FFFFFF), Naranja CGR (#EF8843), Slate Oscuro (#0F172A)
- **Tipografía**: Segoe UI / Sans Serif

---
**CGR Segur@ 2026** - Contraloría General de la República de Costa Rica.
Basado en normativas internacionales de ciberseguridad.
