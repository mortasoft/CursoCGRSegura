# 🔐 Configuración de Google OAuth 2.0 para CGR LMS

## Paso 1: Crear Proyecto en Google Cloud

1. **Ir a Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Iniciar sesión con tu cuenta de Google

2. **Crear un Nuevo Proyecto**
   - Clic en el selector de proyectos (arriba a la izquierda)
   - Clic en "NEW PROJECT"
   - Nombre del proyecto: `CGR LMS`
   - Organization: Seleccionar tu organización (si aplica)
   - Clic en "CREATE"

3. **Seleccionar el Proyecto**
   - Asegúrate de que "CGR LMS" esté seleccionado en el selector de proyectos

## Paso 2: Configurar OAuth Consent Screen

1. **Ir a OAuth Consent Screen**
   - Menú → APIs & Services → OAuth consent screen
   - URL directa: https://console.cloud.google.com/apis/credentials/consent

2. **Configurar el Consent Screen**
   
   **User Type:**
   - Seleccionar "Internal" si solo para usuarios de tu organización
   - O "External" si quieres permitir cualquier cuenta de Google
   - Clic en "CREATE"

   **App Information:**
   - App name: `CGR Segur@ LMS`
   - User support email: `soporte@cgr.go.cr`
   - App logo: (Opcional) Subir logo de la CGR

   **App Domain:**
   - Application home page: `http://localhost:3000` (desarrollo)
   - Application privacy policy link: `http://localhost:3000/privacy`
   - Application terms of service link: `http://localhost:3000/terms`

   **Authorized domains:**
   ```
   localhost
   cgr.go.cr
   ```

   **Developer contact information:**
   - Email: `dev@cgr.go.cr`

   - Clic en "SAVE AND CONTINUE"

3. **Scopes (Alcances)**
   - Clic en "ADD OR REMOVE SCOPES"
   - Seleccionar:
     - `userinfo.email`
     - `userinfo.profile`
     - `openid`
   - Clic en "UPDATE"
   - Clic en "SAVE AND CONTINUE"

4. **Test Users** (solo si es Internal)
   - Agregar emails de prueba:
     ```
     admin@cgr.go.cr
     funcionario@cgr.go.cr
     ```
   - Clic en "SAVE AND CONTINUE"

5. **Summary**
   - Revisar la configuración
   - Clic en "BACK TO DASHBOARD"

## Paso 3: Crear Credenciales OAuth 2.0

1. **Ir a Credentials**
   - Menú → APIs & Services → Credentials
   - URL directa: https://console.cloud.google.com/apis/credentials

2. **Crear OAuth Client ID**
   - Clic en "+ CREATE CREDENTIALS"
   - Seleccionar "OAuth client ID"

3. **Configurar el Client ID**
   
   **Application type:**
   - Seleccionar "Web application"

   **Name:**
   - `CGR LMS Web Client`

   **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   http://localhost
   https://lms.cgr.go.cr (producción)
   ```

   **Authorized redirect URIs:**
   ```
   http://localhost:3000
   http://localhost:3000/login
   https://lms.cgr.go.cr (producción)
   https://lms.cgr.go.cr/login (producción)
   ```

   - Clic en "CREATE"

4. **Copiar Credenciales**
   
   Se mostrará un modal con:
   - **Client ID**: `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxx`

   **¡IMPORTANTE!** Guarda estas credenciales de forma segura.

## Paso 4: Configurar el Proyecto CGR LMS

### Backend (.env)

```bash
cd /home/mortasoft/Github/CursoCGRSegura/cgr-lms
nano backend/.env
```

Agregar:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

### Frontend (.env)

```bash
nano .env
```

Agregar:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## Paso 5: Probar la Configuración

1. **Iniciar el sistema**
   ```bash
   ./start.sh
   ```

2. **Abrir el navegador**
   - Ir a: http://localhost:3000

3. **Probar el login**
   - Clic en "Sign in with Google"
   - Debería aparecer el popup de Google
   - Seleccionar una cuenta de prueba
   - Autorizar la aplicación

4. **Verificar**
   - Deberías ser redirigido al dashboard
   - Tu información de usuario debería aparecer en la navbar

## Solución de Problemas

### Error: "redirect_uri_mismatch"

**Causa:** La URL de redirección no coincide con las configuradas en Google Cloud.

**Solución:**
1. Ir a Google Cloud Console → Credentials
2. Editar el OAuth Client ID
3. Agregar la URL exacta que aparece en el error
4. Guardar y esperar 5 minutos

### Error: "Access blocked: This app's request is invalid"

**Causa:** El OAuth Consent Screen no está configurado correctamente.

**Solución:**
1. Ir a OAuth consent screen
2. Completar todos los campos requeridos
3. Agregar los scopes necesarios
4. Publicar la app (si es External)

### Error: "Invalid client"

**Causa:** El Client ID o Secret son incorrectos.

**Solución:**
1. Verificar que copiaste correctamente las credenciales
2. Verificar que no haya espacios extra
3. Regenerar las credenciales si es necesario

### Error: "Email not allowed"

**Causa:** El dominio del email no es @cgr.go.cr

**Solución:**
1. Para desarrollo, comentar temporalmente la validación en `backend/routes/auth.js`:
   ```javascript
   // Comentar estas líneas para desarrollo
   // if (!email.endsWith('@cgr.go.cr')) {
   //   return res.status(403).json({...});
   // }
   ```

2. O agregar tu email de prueba a la whitelist

## Configuración para Producción

### 1. Actualizar URLs

En Google Cloud Console:

**Authorized JavaScript origins:**
```
https://lms.cgr.go.cr
```

**Authorized redirect URIs:**
```
https://lms.cgr.go.cr
https://lms.cgr.go.cr/login
https://lms.cgr.go.cr/auth/callback
```

### 2. Publicar la App

Si usaste "External":
1. Ir a OAuth consent screen
2. Clic en "PUBLISH APP"
3. Confirmar la publicación

### 3. Actualizar Variables de Entorno

```env
# Producción
FRONTEND_URL=https://lms.cgr.go.cr
NODE_ENV=production
```

### 4. Configurar HTTPS

Asegúrate de tener certificados SSL configurados en Nginx.

## Verificación de Seguridad

### ✅ Checklist de Seguridad

- [ ] Client Secret está en `.env` y NO en el código
- [ ] `.env` está en `.gitignore`
- [ ] Solo dominios autorizados en Google Cloud
- [ ] OAuth Consent Screen completamente configurado
- [ ] Scopes mínimos necesarios
- [ ] HTTPS en producción
- [ ] Validación de dominio @cgr.go.cr activa

## Recursos Adicionales

- **Documentación oficial**: https://developers.google.com/identity/protocols/oauth2
- **React OAuth Library**: https://www.npmjs.com/package/@react-oauth/google
- **Google Cloud Console**: https://console.cloud.google.com/

## Contacto

Si tienes problemas con la configuración:
- Email: soporte@cgr.go.cr
- Documentación: Ver README.md y INSTALL.md

---

**Última actualización**: Enero 2026
