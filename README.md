# Project Base Template

Plantilla base para aplicaciones web full-stack con autenticación, autorización y gestión de usuarios. Esta plantilla proporciona una base sólida y lista para usar que puedes personalizar según las necesidades de tu proyecto.

## 🚀 Características Incluidas

### Backend
- ✅ Autenticación con JWT
- ✅ Sistema de roles y permisos
- ✅ Gestión de usuarios
- ✅ Comunicación en tiempo real con WebSocket (Socket.io)
- ✅ Sistema de envío de emails
- ✅ Middleware de autorización
- ✅ Logging centralizado
- ✅ Manejo de errores estructurado

### Frontend
- ✅ Interfaz de login y recuperación de contraseña
- ✅ Dashboard principal (Home)
- ✅ Gestión de usuarios (CRUD completo)
- ✅ Gestión de roles y permisos
- ✅ Guards de autenticación y autorización
- ✅ Servicios WebSocket para comunicación en tiempo real
- ✅ Diseño responsive

### Base de Datos
- ✅ Esquema base con tablas: users, roles, permissions, role_has_permission
- ✅ Usuario administrador por defecto (admin / 123qwe)
- ✅ Permisos base: permissions_manager, users_manager
- ✅ Scripts de verificación de base de datos

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Frontend | Angular CLI | 17.1.0 |
| Backend | Node.js | 20.11.0 |
| Lenguaje | TypeScript | - |
| Package Manager | npm | 10.2.4 |
| Base de Datos | MySQL | 8.x |
| ORM | Sequelize | 6.x |
| Comunicación | Socket.io | - |
| Contenedores | Docker | - |
| Proxy | Nginx | - |

## 📋 Requisitos Previos

- Node.js 20.11.0 o superior
- npm 10.2.4 o superior
- MySQL 8.x
- Git

## 🚀 Inicio Rápido

### 1. Clonar el Repositorio
```bash
git clone <tu-repositorio>
cd <nombre-proyecto>
```

### 2. Configurar Base de Datos
```bash
# Crear la base de datos en MySQL
mysql -u root -p < 1_Project/4_Database/schema.sql

# Verificar la instalación
mysql -u root -p < 1_Project/4_Database/verify_database.sql
```

### 3. Configurar Variables de Entorno

**Backend** - Copiar y editar `.env`:
```bash
cd 1_Project/1_Sources/backend
cp .env.template .env
# Editar .env con tus configuraciones
```

Variables principales:
- `APP_PORT`: Puerto del backend (default: 5555)
- `APP_DB_*`: Configuración de base de datos
- `APP_SEED`: Semilla para JWT
- `APP_SMTP_*`: Configuración de email

### 4. Instalar Dependencias

**Backend:**
```bash
cd 1_Project/1_Sources/backend
npm install
```

**Frontend:**
```bash
cd 1_Project/1_Sources/frontend
npm install
```

### 5. Ejecutar en Modo Desarrollo

**Backend** (en una terminal):
```bash
cd 1_Project/1_Sources/backend
tsc -w  # En una terminal
npm start  # En otra terminal
```

**Frontend** (en otra terminal):
```bash
cd 1_Project/1_Sources/frontend
npm start
```

### 6. Acceder a la Aplicación

Abrir navegador en: `http://localhost:4200`

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `123qwe`

## 🐳 Despliegue con Docker

### Levantar contenedores
```bash
cd 1_Project/1_Sources
docker-compose up -d
```

### Reconstruir con cambios
```bash
docker-compose up -d --build
```

### Detener contenedores
```bash
docker-compose down
```

### Acceder a un contenedor
```bash
docker exec -it app-base-backend bash
docker exec -it app-base-frontend bash
docker exec -it app-base-db bash
```

## 📁 Estructura del Proyecto

```
1_Project/
├── 1_Sources/
│   ├── backend/          # Código del servidor Node.js
│   │   ├── config/       # Configuraciones
│   │   ├── controllers/  # Controladores WebSocket
│   │   ├── models/       # Modelos Sequelize
│   │   ├── routes/       # Rutas de la API
│   │   ├── services/     # Lógica de negocio
│   │   ├── server/       # Configuración del servidor
│   │   └── utils/        # Utilidades
│   ├── frontend/         # Aplicación Angular
│   │   └── src/
│   │       ├── app/
│   │       │   ├── components/  # Componentes
│   │       │   ├── guards/      # Guards de rutas
│   │       │   ├── models/      # Modelos TypeScript
│   │       │   └── services/    # Servicios
│   │       └── environments/    # Configuraciones de entorno
│   ├── nginx/            # Configuración Nginx
│   └── docker-compose.yml
├── 2_Docs/               # Documentación
│   ├── 1_Technical/      # Documentación técnica
│   ├── 2_Issues/         # Issues y problemas
│   └── 3_Meetings/       # Actas de reuniones
├── 3_Resources/          # Recursos adicionales
└── 4_Database/           # Scripts de base de datos
    ├── schema.sql        # Esquema completo
    └── verify_database.sql
```

## 🔧 Comandos Útiles

### Backend
```bash
# Compilar TypeScript
cd 1_Project/1_Sources/backend
tsc

# Modo watch
tsc -w

# Iniciar servidor
npm start

# Verificar errores de TypeScript
tsc --noEmit
```

### Frontend
```bash
# Iniciar en desarrollo
cd 1_Project/1_Sources/frontend
npm start

# Build de producción
ng build --configuration production

# Ejecutar tests
ng test

# Linting
ng lint
```

### Base de Datos
```bash
# Conectar a MySQL
mysql -u root -p app-base

# Ejecutar script
mysql -u root -p < 1_Project/4_Database/schema.sql

# Verificar instalación
mysql -u root -p < 1_Project/4_Database/verify_database.sql
```

## 📝 Próximos Pasos

Después de instalar la plantilla, puedes:

1. **Personalizar la aplicación:**
   - Cambiar nombre del proyecto en `package.json`
   - Actualizar logos e imágenes en `frontend/src/assets/images/`
   - Modificar estilos en `frontend/src/styles.css`

2. **Agregar nuevos módulos:**
   - Crear modelos en backend y frontend
   - Agregar controladores y servicios
   - Crear componentes en Angular
   - Ver guía: `1_Project/2_Docs/guides/adding-modules.md` (próximamente)

3. **Configurar email:**
   - Actualizar variables `APP_SMTP_*` en `.env`
   - Personalizar plantillas en `backend/files/templates/`

4. **Agregar nuevos permisos:**
   - Insertar en tabla `permissions`
   - Asignar a roles en `role_has_permission`
   - Actualizar guards en frontend

5. **Desplegar en producción:**
   - Configurar variables de entorno de producción
   - Usar Docker Compose para despliegue
   - Configurar Nginx como proxy reverso
   - Ver guía: `1_Project/2_Docs/1_Technical/Prod - Despliegue Y-Toledo Docker.md`

## 📚 Documentación Adicional

- [Guía de Inicio Rápido](1_Project/QUICK_START.md)
- [Documentación Técnica](1_Project/2_Docs/1_Technical/)
- [Arquitectura del Sistema](1_Project/2_Docs/1_Technical/Route%20Pages%20Architecture.md)
- [Configuración de Nginx](1_Project/2_Docs/1_Technical/Nginx.md)
- [Despliegue con Docker](1_Project/2_Docs/1_Technical/Prod%20-%20Despliegue%20Y-Toledo%20Docker.md)

## 🤝 Contribuciones

Esta es una plantilla base. Siéntete libre de personalizarla según tus necesidades.

## 📄 Licencia

[Especificar licencia]

## 🆘 Soporte

Para problemas o preguntas, consulta la documentación en `1_Project/2_Docs/` o crea un issue en el repositorio.
