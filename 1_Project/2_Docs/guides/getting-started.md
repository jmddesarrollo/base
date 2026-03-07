# Guía de Inicio Rápido - Project Base Template

Esta guía te ayudará a configurar y ejecutar la plantilla base en tu entorno de desarrollo local.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Instalación](#instalación)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Instalación de Dependencias](#instalación-de-dependencias)
6. [Primer Despliegue](#primer-despliegue)
7. [Verificación de Instalación](#verificación-de-instalación)
8. [Solución de Problemas](#solución-de-problemas)

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

### Software Requerido

| Software | Versión Mínima | Verificación |
|----------|----------------|--------------|
| Node.js | 20.11.0 | `node --version` |
| npm | 10.2.4 | `npm --version` |
| MySQL | 8.0 | `mysql --version` |
| Git | 2.x | `git --version` |

### Instalación de Requisitos

#### Node.js y npm

**Linux (Ubuntu/Debian):**
```bash
# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

**macOS:**
```bash
# Usando Homebrew
brew install node@20

# Verificar instalación
node --version
npm --version
```

**Windows:**
- Descargar instalador desde [nodejs.org](https://nodejs.org/)
- Ejecutar instalador y seguir instrucciones
- Verificar en CMD: `node --version` y `npm --version`

#### MySQL

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install mysql-server
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Windows:**
- Descargar instalador desde [mysql.com](https://dev.mysql.com/downloads/installer/)
- Ejecutar instalador y seguir instrucciones

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <url-del-repositorio>

# Entrar al directorio del proyecto
cd <nombre-del-proyecto>

# Verificar que estás en la rama correcta
git branch
```

### 2. Estructura del Proyecto

Después de clonar, deberías ver esta estructura:

```
proyecto/
├── 1_Project/
│   ├── 1_Sources/
│   │   ├── backend/      # Código del servidor
│   │   ├── frontend/     # Aplicación Angular
│   │   ├── nginx/        # Configuración Nginx
│   │   └── docker-compose.yml
│   ├── 2_Docs/           # Documentación
│   ├── 3_Resources/      # Recursos adicionales
│   └── 4_Database/       # Scripts SQL
├── README.md
└── .gitignore
```

---

## 🗄️ Configuración de Base de Datos

### 1. Iniciar MySQL

```bash
# Linux/macOS
sudo systemctl start mysql
# o
sudo service mysql start

# Verificar que está corriendo
sudo systemctl status mysql
```

### 2. Acceder a MySQL

```bash
# Conectar como root
mysql -u root -p
# Ingresa tu contraseña de MySQL
```

### 3. Crear Base de Datos

Opción A: Desde línea de comandos MySQL
```sql
-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS `app-base` DEFAULT CHARACTER SET utf8;

-- Verificar que se creó
SHOW DATABASES;

-- Salir
EXIT;
```

Opción B: Usando el script SQL
```bash
# Desde la terminal (fuera de MySQL)
mysql -u root -p < 1_Project/4_Database/schema.sql
```

### 4. Verificar Instalación de Base de Datos

```bash
# Ejecutar script de verificación
mysql -u root -p < 1_Project/4_Database/verify_database.sql
```

Deberías ver:
```
Database: app-base
Tables in app-base:
permissions
role_has_permission
roles
users

Total users: 1
Admin user exists: 1
Total roles: 3
Total permissions: 2
```

### 5. Verificar Datos Iniciales

```bash
# Conectar a la base de datos
mysql -u root -p app-base

# Verificar usuario admin
SELECT id, username, email, role_id FROM users;

# Verificar roles
SELECT * FROM roles;

# Verificar permisos
SELECT * FROM permissions;

# Salir
EXIT;
```

---

## ⚙️ Configuración de Variables de Entorno

### Backend

1. **Navegar a la carpeta del backend:**
```bash
cd 1_Project/1_Sources/backend
```

2. **Copiar el archivo template:**
```bash
cp .env.template .env
```

3. **Editar el archivo `.env`:**
```bash
# Usar tu editor favorito
nano .env
# o
vim .env
# o
code .env  # VS Code
```

4. **Configurar las variables:**

```bash
# Entorno de ejecución
APP_NODE_ENV="development"

# Versión de la aplicación
APP_VERSION="1_0_0"

# Configuración del servidor
APP_SERVER_PORT=5555
APP_SERVER_URL="0.0.0.0"

# Seguridad - IMPORTANTE: Cambiar en producción
APP_SEED="tu-semilla-secreta-aqui-cambiar-en-produccion"
APP_EXPIRATION_TOKEN="12H"
APP_EXPIRATION_TOKEN_RECOVERY="1H"

# Nombre del servicio
APP_SERVICE_NAME="app-base"

# Configuración de correo electrónico
APP_MAILER_HOST="smtp.gmail.com"
APP_MAILER_PORT=587
APP_MAILER_USER="tu-email@example.com"
APP_MAILER_PASSWORD="tu-contraseña-de-aplicacion"

# Configuración de base de datos
APP_BD_HOST="localhost"
APP_BD_USER="root"
APP_BD_PASSWORD="tu-contraseña-mysql"
```

### Variables Importantes

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `APP_SERVER_PORT` | Puerto del backend | 5555 |
| `APP_SEED` | Semilla para JWT (¡cambiar en producción!) | - |
| `APP_BD_HOST` | Host de MySQL | localhost |
| `APP_BD_USER` | Usuario de MySQL | root |
| `APP_BD_PASSWORD` | Contraseña de MySQL | - |
| `APP_MAILER_USER` | Email para envío | - |
| `APP_MAILER_PASSWORD` | Contraseña de email | - |

### Configuración de Email (Opcional)

Si quieres usar el sistema de envío de emails:

**Gmail:**
1. Habilitar "Verificación en 2 pasos" en tu cuenta de Google
2. Generar una "Contraseña de aplicación":
   - Ir a: https://myaccount.google.com/apppasswords
   - Seleccionar "Correo" y "Otro (nombre personalizado)"
   - Copiar la contraseña generada
3. Usar esa contraseña en `APP_MAILER_PASSWORD`

**Otros proveedores:**
- Consultar documentación del proveedor para configuración SMTP
- Actualizar `APP_MAILER_HOST` y `APP_MAILER_PORT` según corresponda

### Frontend

El frontend usa configuraciones en `src/environments/`:

**Para desarrollo** (`environment.ts`):
```typescript
export const environment = {
  production: false,
  appName: 'App Base',
  wsEndpoint: 'http://localhost:5555'
};
```

**Para producción** (`environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  appName: 'App Base',
  wsEndpoint: 'https://tu-dominio.com'
};
```

---

## 📦 Instalación de Dependencias

### Backend

```bash
# Navegar a la carpeta del backend
cd 1_Project/1_Sources/backend

# Instalar dependencias
npm install

# Verificar que no hay errores
npm list --depth=0
```

**Dependencias principales instaladas:**
- express: Framework web
- socket.io: WebSocket
- sequelize: ORM para MySQL
- mysql2: Driver de MySQL
- bcrypt: Hash de contraseñas
- jsonwebtoken: Autenticación JWT
- nodemailer: Envío de emails
- cors: CORS middleware

### Frontend

```bash
# Navegar a la carpeta del frontend
cd 1_Project/1_Sources/frontend

# Instalar dependencias
npm install

# Verificar que no hay errores
npm list --depth=0
```

**Dependencias principales instaladas:**
- @angular/core: Framework Angular
- @angular/router: Enrutamiento
- socket.io-client: Cliente WebSocket
- rxjs: Programación reactiva

---

## 🎯 Primer Despliegue

### Opción 1: Modo Desarrollo (Recomendado para empezar)

#### Terminal 1: Backend

```bash
# Navegar al backend
cd 1_Project/1_Sources/backend

# Compilar TypeScript en modo watch
tsc -w
```

Deberías ver:
```
Starting compilation in watch mode...
Found 0 errors. Watching for file changes.
```

#### Terminal 2: Servidor Backend

```bash
# En otra terminal, navegar al backend
cd 1_Project/1_Sources/backend

# Iniciar servidor
npm start
```

Deberías ver:
```
Server running on port 5555
Database connected successfully
WebSocket server initialized
```

#### Terminal 3: Frontend

```bash
# En otra terminal, navegar al frontend
cd 1_Project/1_Sources/frontend

# Iniciar servidor de desarrollo
npm start
```

Deberías ver:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

### Opción 2: Modo Producción con Docker

```bash
# Navegar a la carpeta de sources
cd 1_Project/1_Sources

# Construir y levantar contenedores
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Verificar que los contenedores están corriendo
docker-compose ps
```

---

## ✅ Verificación de Instalación

### 1. Verificar Backend

**Abrir navegador en:** `http://localhost:5555`

Deberías ver un mensaje de bienvenida o error 404 (normal, no hay ruta raíz).

**Verificar WebSocket:**
Abrir consola del navegador (F12) y ejecutar:
```javascript
const socket = io('http://localhost:5555');
socket.on('connect', () => console.log('WebSocket conectado!'));
```

### 2. Verificar Frontend

**Abrir navegador en:** `http://localhost:4200`

Deberías ver la página de login de la aplicación.

### 3. Probar Login

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `123qwe`

**Pasos:**
1. Ingresar credenciales
2. Click en "Iniciar Sesión"
3. Deberías ser redirigido a `/home`
4. Verificar que aparece el menú de navegación

### 4. Verificar Funcionalidades

**Gestión de Usuarios:**
1. Click en "Usuarios" en el menú
2. Deberías ver la lista de usuarios (al menos el admin)
3. Probar crear un nuevo usuario
4. Probar editar usuario
5. Probar eliminar usuario

**Gestión de Permisos:**
1. Click en "Permisos" en el menú
2. Deberías ver la lista de permisos
3. Verificar que existen: `permissions_manager`, `users_manager`

### 5. Verificar WebSocket en Tiempo Real

1. Abrir la aplicación en dos navegadores diferentes
2. En uno, crear un nuevo usuario
3. En el otro, deberías ver la actualización en tiempo real

---

## 🔧 Solución de Problemas

### Problema: Backend no inicia

**Error: "Cannot find module"**
```bash
# Solución: Reinstalar dependencias
cd 1_Project/1_Sources/backend
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 5555 already in use"**
```bash
# Solución 1: Cambiar puerto en .env
APP_SERVER_PORT=5556

# Solución 2: Matar proceso en puerto 5555
# Linux/macOS
lsof -ti:5555 | xargs kill -9

# Windows
netstat -ano | findstr :5555
taskkill /PID <PID> /F
```

**Error: "Cannot connect to database"**
```bash
# Verificar que MySQL está corriendo
sudo systemctl status mysql

# Verificar credenciales en .env
# Verificar que la base de datos existe
mysql -u root -p -e "SHOW DATABASES;"
```

### Problema: Frontend no compila

**Error: "Module not found"**
```bash
# Solución: Reinstalar dependencias
cd 1_Project/1_Sources/frontend
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 4200 already in use"**
```bash
# Solución: Usar otro puerto
ng serve --port 4201
```

### Problema: No puedo hacer login

**Verificar usuario en base de datos:**
```sql
USE `app-base`;
SELECT id, username, email, active FROM users WHERE username = 'admin';
```

**Verificar contraseña:**
- La contraseña por defecto es: `123qwe`
- Si no funciona, resetear contraseña:

```sql
-- Contraseña: 123qwe (hash bcrypt)
UPDATE users 
SET password = '$2b$10$1WuyQJGknupSkv6SzRloK.EwvXsd3AHprSj5P39zq4PXk1u5jtAty'
WHERE username = 'admin';
```

**Verificar que el usuario está activo:**
```sql
UPDATE users SET active = 1, attempts = 0 WHERE username = 'admin';
```

### Problema: WebSocket no conecta

**Verificar CORS en backend:**
- Archivo: `backend/server/server.ts`
- Debe tener configuración de CORS para `http://localhost:4200`

**Verificar en consola del navegador:**
```javascript
// Abrir DevTools (F12) y ejecutar:
console.log('WebSocket URL:', environment.wsEndpoint);
```

### Problema: Emails no se envían

**Verificar configuración SMTP:**
```bash
# Ver logs del backend
cd 1_Project/1_Sources/backend
npm start
# Buscar errores relacionados con SMTP
```

**Probar conexión SMTP:**
```javascript
// Crear archivo test-email.js en backend
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.APP_MAILER_HOST,
  port: process.env.APP_MAILER_PORT,
  auth: {
    user: process.env.APP_MAILER_USER,
    pass: process.env.APP_MAILER_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('SMTP configurado correctamente');
  }
});
```

---

## 📚 Próximos Pasos

Una vez que tengas la aplicación funcionando:

1. **Personalizar la aplicación:**
   - Ver: [Guía de Personalización](customization-guide.md)

2. **Agregar nuevos módulos:**
   - Ver: [Guía de Agregar Módulos](adding-modules.md)

3. **Desplegar en producción:**
   - Ver: [Documentación de Despliegue](../1_Technical/Prod%20-%20Despliegue%20Y-Toledo%20Docker.md)

4. **Entender la arquitectura:**
   - Ver: [Documentación de Arquitectura](../architecture/overview.md)

---

## 🆘 Obtener Ayuda

Si encuentras problemas no cubiertos en esta guía:

1. Revisar la [documentación técnica](../1_Technical/)
2. Revisar los [issues conocidos](../2_Issues/)
3. Crear un nuevo issue en el repositorio
4. Consultar con el equipo de desarrollo

---

## ✅ Checklist de Instalación Completa

- [ ] Node.js y npm instalados
- [ ] MySQL instalado y corriendo
- [ ] Repositorio clonado
- [ ] Base de datos `app-base` creada
- [ ] Datos iniciales cargados
- [ ] Variables de entorno configuradas (backend)
- [ ] Dependencias instaladas (backend)
- [ ] Dependencias instaladas (frontend)
- [ ] Backend compilando sin errores
- [ ] Backend corriendo en puerto 5555
- [ ] Frontend corriendo en puerto 4200
- [ ] Login funciona con admin/123qwe
- [ ] Navegación a /home funciona
- [ ] Gestión de usuarios funciona
- [ ] WebSocket conecta correctamente

¡Felicitaciones! Tu instalación está completa. 🎉
