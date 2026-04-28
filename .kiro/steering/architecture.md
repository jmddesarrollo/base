# Arquitectura del Proyecto - App Base

> **IMPORTANTE**: Cualquier IA que vaya a implementar tareas en este proyecto DEBE leer este documento antes de actuar. Respetar esta arquitectura es obligatorio.

## Descripción General

App Base es una plantilla de aplicación web full-stack que sirve como base para cualquier proyecto. Incluye autenticación de usuarios, gestión de roles y permisos, y comunicación en tiempo real vía WebSockets.

## Stack Tecnológico

### Backend
- **Runtime**: Node.js (ver `.nvmrc`)
- **Lenguaje**: TypeScript
- **Framework**: Express.js
- **Comunicación**: Socket.IO (WebSockets) — **TODA la comunicación cliente-servidor usa WebSockets, NO HTTP REST**
- **ORM**: Sequelize con MySQL
- **Autenticación**: JWT (jsonwebtoken) + bcrypt para contraseñas
- **Patrón**: Singleton para el servidor

### Frontend
- **Framework**: Angular 17
- **Comunicación**: Socket.IO client — **NO usar HttpClient para llamadas al backend propio**
- **Estilos**: CSS propio + W3.CSS

### Infraestructura
- **Contenedores**: Docker + Docker Compose
- **Proxy inverso**: Nginx
- **Base de datos**: MySQL

## Estructura del Backend

```
backend/
├── config/           # Configuración por entorno (development/production)
├── controllers/ws/   # Controladores de eventos WebSocket
├── models/           # Modelos Sequelize (ORM)
├── routes/ws/        # Definición de eventos WebSocket por dominio
├── server/
│   ├── cron/         # Tareas programadas
│   ├── mail/         # Servicio de envío de email SMTP
│   ├── middlewares/  # Middleware de autorización JWT
│   └── sh/           # Ejecución de scripts shell
├── services/
│   ├── email/        # BLL de email
│   ├── permission/   # BLL + DAL de permisos
│   ├── role/         # BLL + DAL de roles
│   └── user/         # BLL + DAL de usuarios y autenticación
├── types/            # Tipos TypeScript personalizados
└── utils/            # Utilidades (ControlException, logger)
```

### Patrón de Capas (Backend)

Cada dominio sigue estrictamente este patrón de 3 capas:

```
Controller (ws/) → BLL (services/*.bll.ts) → DAL (services/*.dal.ts) → Model
```

- **Controller**: Recibe el evento socket, llama al BLL, emite respuesta
- **BLL** (Business Logic Layer): Lógica de negocio, validaciones
- **DAL** (Data Access Layer): Acceso a base de datos vía Sequelize
- **Model**: Definición de tabla y validaciones de modelo

### Comunicación WebSocket

Los eventos siguen el patrón `dominio/accion`:
- `auth/login`, `auth/logout`, `auth/renewToken`
- `user/getUsers`, `user/addUser`, `user/editUser`
- `permission/getPermissions`, etc.

Los errores se emiten como: `socket.emit("error_message", { message, code })`
La falta de permisos: `socket.emit("auth/notAllowed", { mode })`

### Gestión de Errores

Usar siempre `ControlException` para errores controlados:
```typescript
throw new ControlException('Mensaje de error', codigoHTTP);
```

Los controllers capturan y emiten:
```typescript
catch (error) {
    if (error instanceof ControlException) {
        socket.emit("error_message", { message: error.message, code: error.code });
    } else {
        socket.emit("error_message", { message: "Error no controlado" });
    }
}
```

### Transacciones de Base de Datos

Las operaciones de escritura usan transacciones Sequelize:
```typescript
let t = await sequelize.transaction();
// ... operaciones ...
t.commit(); // o t.rollback() en catch
```

## Estructura del Frontend

```
frontend/src/app/
├── components/       # Componentes Angular por dominio
├── guards/           # Guards de rutas (auth.guard.ts)
├── models/           # Interfaces TypeScript
├── pipes/            # Pipes personalizados
├── services/
│   ├── global.ts     # Variables globales compartidas
│   ├── websocket.service.ts  # Servicio base WebSocket
│   ├── http/         # Servicios HTTP (solo para APIs externas)
│   ├── share/        # Servicios compartidos entre componentes
│   └── websockets/   # Servicios WebSocket por dominio
└── utils/            # Utilidades (mensajes de error, etc.)
```

### Patrón de Comunicación Frontend

**NUNCA usar HttpClient para llamadas al backend propio.** Usar siempre el `WebsocketService`.

```typescript
// Emitir evento
this.wsService.emit('auth/login', { userName, password });

// Escuchar respuesta
this.wsService.listen('auth/login').subscribe(data => { ... });
```

## Seguridad

### Autenticación
- JWT almacenado en el cliente (localStorage/sessionStorage)
- Token incluido en cada petición WebSocket como `req.token`
- Expiración configurable via `APP_EXPIRATION_TOKEN`
- Bloqueo de cuenta tras 3 intentos fallidos (1 minuto)
- Recuperación de contraseña via email con token de corta duración

### Autorización
- Sistema de Roles y Permisos (RBAC)
- Tabla `role_has_permission` con flags `reading` y `writing`
- Middleware `AuthorizedMiddleware.isAllowed()` para verificar permisos
- Usuario administrador por defecto protegido contra modificaciones críticas

### Contraseñas
- Hash con bcrypt (saltRounds: 10)
- Validación de formato: mínimo 6 caracteres, mayúscula, minúscula, número y carácter especial (`$€#%&_-`)

## Variables de Entorno

Ver `.env.template` para la lista completa. Las críticas son:
- `APP_SEED`: Secreto para firmar JWT — **nunca hardcodear**
- `APP_EXPIRATION_TOKEN`: Duración del token de sesión
- `APP_NODE_ENV`: Entorno (`development` | `production`)

## Base de Datos

- Motor: MySQL
- ORM: Sequelize
- Tablas base: `users`, `roles`, `permissions`, `role_has_permission`
- Ver `1_Project/4_Database/schema.sql` para el esquema completo

## Convenciones de Código

- Archivos de servicio: `nombre.bll.ts` (lógica) y `nombre.dal.ts` (datos)
- Archivos de controlador: `nombre.controller.ts`
- Archivos de rutas WebSocket: `nombre.route.ts` en `routes/ws/`
- Modelos: `nombre.model.ts`
- Clases exportadas con `export default` o `export class`

## Lo que NO se debe hacer

- ❌ Crear endpoints HTTP REST para el backend propio (usar WebSockets)
- ❌ Hardcodear credenciales o secretos en el código
- ❌ Saltarse el patrón Controller → BLL → DAL
- ❌ Acceder a la base de datos directamente desde un Controller
- ❌ Usar HttpClient en el frontend para llamar al backend propio
- ❌ Modificar el usuario administrador por defecto sin las validaciones correspondientes
- ❌ Emitir la contraseña del usuario en ninguna respuesta
