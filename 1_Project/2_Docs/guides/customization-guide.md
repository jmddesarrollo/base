# Guía de Personalización - Project Base Template

Esta guía te ayudará a personalizar la plantilla base para adaptarla a las necesidades específicas de tu proyecto.

## 📋 Tabla de Contenidos

1. [Renombrar el Proyecto](#renombrar-el-proyecto)
2. [Cambiar Nombre de Base de Datos](#cambiar-nombre-de-base-de-datos)
3. [Personalizar Tema y Estilos](#personalizar-tema-y-estilos)
4. [Configurar Sistema de Email](#configurar-sistema-de-email)
5. [Agregar Nuevos Roles y Permisos](#agregar-nuevos-roles-y-permisos)
6. [Personalizar Logos e Imágenes](#personalizar-logos-e-imágenes)
7. [Configurar Dominio y URLs](#configurar-dominio-y-urls)

---

## 🏷️ Renombrar el Proyecto

### 1. Actualizar package.json

**Backend** (`1_Project/1_Sources/backend/package.json`):
```json
{
  "name": "mi-proyecto-backend",
  "version": "1.0.0",
  "description": "Backend de Mi Proyecto",
  "author": "Tu Nombre <tu@email.com>",
  ...
}
```

**Frontend** (`1_Project/1_Sources/frontend/package.json`):
```json
{
  "name": "mi-proyecto-frontend",
  "version": "1.0.0",
  "description": "Frontend de Mi Proyecto",
  "author": "Tu Nombre <tu@email.com>",
  ...
}
```

### 2. Actualizar Variables de Entorno

**Backend** (`.env`):
```bash
APP_SERVICE_NAME="mi-proyecto"
```

**Frontend** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  appName: 'Mi Proyecto',
  wsEndpoint: 'http://localhost:5555'
};
```

### 3. Actualizar Docker Compose

**Archivo** (`docker-compose.yml`):
```yaml
services:
  mi-proyecto-backend:
    container_name: mi-proyecto-backend
    ...
  
  mi-proyecto-frontend:
    container_name: mi-proyecto-frontend
    ...
  
  mi-proyecto-db:
    container_name: mi-proyecto-db
    ...
```

### 4. Actualizar Título de la Aplicación

**Frontend** (`src/index.html`):
```html
<head>
  <title>Mi Proyecto</title>
  ...
</head>
```

**Frontend** (`src/app/app.component.ts`):
```typescript
export class AppComponent {
  title = 'Mi Proyecto';
  ...
}
```

---

## 🗄️ Cambiar Nombre de Base de Datos

### 1. Actualizar Script SQL

**Archivo** (`1_Project/4_Database/schema.sql`):

```sql
-- Cambiar todas las referencias de 'app-base' a 'mi_proyecto'
DROP SCHEMA IF EXISTS `mi_proyecto`;
CREATE SCHEMA IF NOT EXISTS `mi_proyecto` DEFAULT CHARACTER SET utf8;
USE `mi_proyecto`;

-- Actualizar todas las tablas
CREATE TABLE IF NOT EXISTS `mi_proyecto`.`roles` (
  ...
);

CREATE TABLE IF NOT EXISTS `mi_proyecto`.`users` (
  ...
);
-- etc.
```

### 2. Actualizar Variables de Entorno

**Backend** (`.env`):
```bash
APP_BD_NAME="mi_proyecto"
```

### 3. Actualizar Configuración Backend

**Archivo** (`backend/config/config.ts`):
```typescript
export const config = {
  database: {
    name: process.env.APP_BD_NAME || 'mi_proyecto',
    ...
  }
};
```

### 4. Recrear Base de Datos

```bash
# Eliminar base de datos anterior (¡cuidado con datos!)
mysql -u root -p -e "DROP DATABASE IF EXISTS \`app-base\`;"

# Crear nueva base de datos
mysql -u root -p < 1_Project/4_Database/schema.sql

# Verificar
mysql -u root -p -e "SHOW DATABASES;"
```

---

## 🎨 Personalizar Tema y Estilos

### 1. Colores Principales

**Archivo** (`frontend/src/styles.css`):

```css
:root {
  /* Colores primarios */
  --primary-color: #007bff;      /* Azul principal */
  --primary-dark: #0056b3;       /* Azul oscuro */
  --primary-light: #66b3ff;      /* Azul claro */
  
  /* Colores secundarios */
  --secondary-color: #6c757d;    /* Gris */
  --success-color: #28a745;      /* Verde */
  --danger-color: #dc3545;       /* Rojo */
  --warning-color: #ffc107;      /* Amarillo */
  --info-color: #17a2b8;         /* Cyan */
  
  /* Colores de fondo */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-dark: #343a40;
  
  /* Colores de texto */
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-light: #ffffff;
}

/* Aplicar colores */
.btn-primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
}
```

### 2. Tipografía

```css
:root {
  --font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
  --font-size-base: 16px;
  --font-size-small: 14px;
  --font-size-large: 18px;
  --font-size-h1: 32px;
  --font-size-h2: 28px;
  --font-size-h3: 24px;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
}

h1 { font-size: var(--font-size-h1); }
h2 { font-size: var(--font-size-h2); }
h3 { font-size: var(--font-size-h3); }
```

### 3. Importar Fuentes Personalizadas

**Archivo** (`frontend/src/index.html`):
```html
<head>
  ...
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
```

### 4. Personalizar Componente Home

**Archivo** (`frontend/src/app/components/home/home.component.css`):
```css
.home-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Personalizar según tu marca */
}

.feature-card {
  border-left: 4px solid var(--primary-color);
  /* Personalizar tarjetas */
}
```

---

## 📧 Configurar Sistema de Email

### 1. Configurar Gmail

**Paso 1: Habilitar verificación en 2 pasos**
1. Ir a: https://myaccount.google.com/security
2. Activar "Verificación en 2 pasos"

**Paso 2: Generar contraseña de aplicación**
1. Ir a: https://myaccount.google.com/apppasswords
2. Seleccionar "Correo" y "Otro (nombre personalizado)"
3. Ingresar nombre: "Mi Proyecto Backend"
4. Copiar la contraseña generada (16 caracteres)

**Paso 3: Configurar en .env**
```bash
APP_MAILER_HOST="smtp.gmail.com"
APP_MAILER_PORT=587
APP_MAILER_USER="tu-email@gmail.com"
APP_MAILER_PASSWORD="xxxx xxxx xxxx xxxx"  # Contraseña de aplicación
```

### 2. Configurar Outlook/Hotmail

```bash
APP_MAILER_HOST="smtp-mail.outlook.com"
APP_MAILER_PORT=587
APP_MAILER_USER="tu-email@outlook.com"
APP_MAILER_PASSWORD="tu-contraseña"
```

### 3. Configurar Servidor SMTP Personalizado

```bash
APP_MAILER_HOST="smtp.tu-dominio.com"
APP_MAILER_PORT=587  # o 465 para SSL
APP_MAILER_USER="noreply@tu-dominio.com"
APP_MAILER_PASSWORD="tu-contraseña-smtp"
```

### 4. Personalizar Plantillas de Email

**Archivo** (`backend/files/templates/signature.html`):
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      padding: 20px;
    }
    .email-container {
      background-color: white;
      padding: 30px;
      border-radius: 10px;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #007bff;
      padding-bottom: 20px;
    }
    .logo {
      max-width: 200px;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      background-color: #007bff;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
    }
    .footer {
      text-align: center;
      color: #666;
      font-size: 12px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="{{logo_url}}" alt="Logo" class="logo">
      <h1>{{title}}</h1>
    </div>
    
    <div class="content">
      <p>Hola {{user_name}},</p>
      <p>{{message}}</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{action_url}}" class="button">{{action_text}}</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2024 Mi Proyecto. Todos los derechos reservados.</p>
      <p>Este es un correo automático, por favor no responder.</p>
    </div>
  </div>
</body>
</html>
```

### 5. Probar Envío de Email

**Crear archivo de prueba** (`backend/test-email.js`):
```javascript
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransporter({
  host: process.env.APP_MAILER_HOST,
  port: process.env.APP_MAILER_PORT,
  secure: false,
  auth: {
    user: process.env.APP_MAILER_USER,
    pass: process.env.APP_MAILER_PASSWORD
  }
});

const mailOptions = {
  from: process.env.APP_MAILER_USER,
  to: 'destinatario@example.com',
  subject: 'Prueba de Email - Mi Proyecto',
  html: '<h1>¡Email configurado correctamente!</h1><p>Este es un email de prueba.</p>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email enviado:', info.response);
  }
});
```

**Ejecutar prueba:**
```bash
cd 1_Project/1_Sources/backend
node test-email.js
```

---

## 👥 Agregar Nuevos Roles y Permisos

### 1. Agregar Nuevo Permiso

**Paso 1: Insertar en base de datos**
```sql
USE `mi_proyecto`;

-- Agregar nuevo permiso
INSERT INTO permissions (name, detail) 
VALUES ('products_manager', 'Gestión de productos');

-- Verificar
SELECT * FROM permissions;
```

**Paso 2: Asignar permiso a rol**
```sql
-- Obtener IDs
SELECT id, name FROM permissions WHERE name = 'products_manager';
SELECT id, name FROM roles WHERE name = 'Administrador';

-- Asignar permiso al rol Administrador (lectura y escritura)
INSERT INTO role_has_permission (permissions_id, roles_id, reading, writing)
VALUES (3, 1, 1, 1);  -- Ajustar IDs según tu BD

-- Verificar
SELECT 
  r.name as role,
  p.name as permission,
  rhp.reading,
  rhp.writing
FROM role_has_permission rhp
JOIN roles r ON rhp.roles_id = r.id
JOIN permissions p ON rhp.permissions_id = p.id;
```

### 2. Actualizar Configuración Backend

**Archivo** (`backend/config/config.ts`):
```typescript
export const config = {
  permissions: {
    permissions_manager: 'permissions_manager',
    users_manager: 'users_manager',
    products_manager: 'products_manager'  // Nuevo permiso
  }
};
```

### 3. Crear Guard en Frontend

**Crear archivo** (`frontend/src/app/guards/products-manager.guard.ts`):
```typescript
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ShareVarService } from '../services/share/share-var.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsManagerGuard implements CanActivate {
  
  constructor(
    private shareVarService: ShareVarService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const permissions = this.shareVarService.getVar('permissions');
    
    if (permissions && permissions.products_manager) {
      return true;
    }
    
    this.router.navigate(['/home']);
    return false;
  }
}
```

### 4. Usar Guard en Rutas

**Archivo** (`frontend/src/app/app-routing.module.ts`):
```typescript
import { ProductsManagerGuard } from './guards/products-manager.guard';

const routes: Routes = [
  ...
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [AuthGuard, ProductsManagerGuard]
  }
];
```

### 5. Agregar Nuevo Rol

```sql
-- Insertar nuevo rol
INSERT INTO roles (name) VALUES ('Vendedor');

-- Asignar permisos al rol Vendedor
INSERT INTO role_has_permission (permissions_id, roles_id, reading, writing)
VALUES 
  (3, 4, 1, 1),  -- products_manager: lectura y escritura
  (2, 4, 1, 0);  -- users_manager: solo lectura

-- Verificar
SELECT * FROM roles;
```

---

## 🖼️ Personalizar Logos e Imágenes

### 1. Preparar Imágenes

**Formatos recomendados:**
- Logo principal: PNG con fondo transparente
- Favicon: ICO o PNG (16x16, 32x32, 64x64)
- Logo para emails: PNG o JPG (máx 200px ancho)

### 2. Reemplazar Logo Principal

**Ubicación:** `frontend/src/assets/images/`

```bash
# Copiar tu logo
cp /ruta/a/tu/logo.png frontend/src/assets/images/logo.png

# Eliminar logos antiguos
rm frontend/src/assets/images/logo_YToledo.*
rm frontend/src/assets/images/logo_seahorse.*
```

### 3. Actualizar Favicon

**Archivo** (`frontend/src/index.html`):
```html
<head>
  ...
  <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
</head>
```

**Copiar favicon:**
```bash
cp /ruta/a/tu/favicon.ico frontend/src/favicon.ico
cp /ruta/a/tu/favicon.ico frontend/src/assets/images/favicon.ico
```

### 4. Actualizar Logo en Componentes

**Archivo** (`frontend/src/app/app.component.html`):
```html
<img src="assets/images/logo.png" alt="Mi Proyecto" class="logo">
```

**Archivo** (`frontend/src/app/components/session/login/login.component.html`):
```html
<div class="login-logo">
  <img src="assets/images/logo.png" alt="Mi Proyecto">
</div>
```

### 5. Actualizar Logo en Emails

**Archivo** (`backend/files/templates/signature.html`):
```html
<img src="https://tu-dominio.com/assets/images/logo.png" alt="Logo">
```

---

## 🌐 Configurar Dominio y URLs

### 1. Configuración de Producción

**Frontend** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  appName: 'Mi Proyecto',
  wsEndpoint: 'https://api.mi-dominio.com'
};
```

**Backend** (`.env.production`):
```bash
APP_NODE_ENV="production"
APP_SERVER_PORT=5555
APP_SERVER_URL="0.0.0.0"

# URLs de producción
APP_FRONTEND_URL="https://mi-dominio.com"
APP_BACKEND_URL="https://api.mi-dominio.com"
```

### 2. Configurar Nginx

**Archivo** (`nginx/nginx.conf`):
```nginx
upstream mi_proyecto_backend {
    server mi-proyecto-backend:5555;
}

server {
    listen 80;
    server_name mi-dominio.com www.mi-dominio.com;
    
    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mi-dominio.com www.mi-dominio.com;
    
    # Certificados SSL
    ssl_certificate /etc/nginx/certs/mi-dominio.crt;
    ssl_certificate_key /etc/nginx/certs/mi-dominio.key;
    
    # Frontend
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://mi_proyecto_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Configurar CORS

**Archivo** (`backend/server/server.ts`):
```typescript
const corsOptions = {
  origin: [
    'http://localhost:4200',           // Desarrollo
    'https://mi-dominio.com',          // Producción
    'https://www.mi-dominio.com'       // Producción con www
  ],
  credentials: true
};

app.use(cors(corsOptions));

// Socket.IO CORS
const io = new Server(server, {
  cors: corsOptions
});
```

---

## ✅ Checklist de Personalización

- [ ] Nombre del proyecto actualizado en package.json
- [ ] Variables de entorno personalizadas
- [ ] Nombre de base de datos cambiado
- [ ] Colores y tema personalizados
- [ ] Tipografía personalizada
- [ ] Sistema de email configurado
- [ ] Plantillas de email personalizadas
- [ ] Nuevos roles y permisos agregados
- [ ] Guards de permisos creados
- [ ] Logos e imágenes reemplazados
- [ ] Favicon actualizado
- [ ] Dominio y URLs configurados
- [ ] Nginx configurado para producción
- [ ] CORS configurado correctamente
- [ ] Aplicación probada con nuevas configuraciones

---

## 📚 Recursos Adicionales

- [Guía de Inicio Rápido](getting-started.md)
- [Guía de Agregar Módulos](adding-modules.md)
- [Documentación de Arquitectura](../architecture/overview.md)
- [Documentación de Despliegue](../1_Technical/Prod%20-%20Despliegue%20App%20Base%20Docker.md)

---

¡Tu proyecto está listo para ser personalizado! 🎨
