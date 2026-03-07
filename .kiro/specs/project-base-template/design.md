# Diseño: Conversión a Plantilla Base de Proyecto

## 1. Visión General del Diseño

Este diseño describe cómo convertir el proyecto Y-Toledo de gestión de rutas de senderismo en una plantilla base reutilizable. El enfoque será modular y sistemático, eliminando código específico del dominio mientras se preserva toda la infraestructura común.

## 2. Arquitectura

### 2.1. Estructura de Carpetas Propuesta

```
project-base-template/
├── backend/
│   ├── config/
│   ├── controllers/
│   │   └── ws/
│   │       ├── auth.controller.ts
│   │       ├── user.controller.ts
│   │       ├── role.controller.ts
│   │       ├── permission.controller.ts
│   │       └── email.controller.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── role.model.ts
│   │   ├── permission.model.ts
│   │   └── role_has_permission.model.ts
│   ├── services/
│   │   ├── user/
│   │   ├── role/
│   │   ├── permission/
│   │   └── email/
│   ├── server/
│   ├── utils/
│   └── data/
│       └── logs/
├── frontend/
│   └── src/
│       └── app/
│           ├── components/
│           │   ├── session/
│           │   ├── users/
│           │   ├── permissions/
│           │   ├── redirect/
│           │   └── home/
│           ├── guards/
│           ├── models/
│           ├── services/
│           ├── pipes/
│           └── utils/
├── database/
│   ├── schema.sql
│   ├── migrations/
│   └── examples/
│       └── routes-module/  (código de rutas como referencia)
├── docs/
│   ├── technical/
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── customization-guide.md
│   │   └── adding-modules.md
│   └── architecture/
├── nginx/
├── docker-compose.yml
└── README.md
```

### 2.2. Componentes a Eliminar

#### Backend:
- `models/route.model.ts`
- `controllers/ws/route.controller.ts`
- `controllers/ws/file-management.controller.ts`
- `services/route/` (toda la carpeta)
- `services/file/` (toda la carpeta)
- `types/file-attachment.types.ts`
- `utils/fileValidation.ts`
- Referencias a rutas y archivos en `server/server.ts`
- Configuración de permisos de rutas y archivos en `config/config.ts`
- Carpeta `data/files/attachments/`

#### Frontend:
- `components/routes/` (toda la carpeta)
- `components/files/` (toda la carpeta)
- `models/route.model.ts`
- `models/file-attachment.model.ts`
- `services/websockets/route.service.ts`
- `guards/routes-manager.guard.ts`
- Rutas de navegación relacionadas con routes y files en `app-routing.module.ts`

#### Database:
- Tabla `routes` del esquema SQL
- Migraciones relacionadas con rutas
- Permisos `routes_manager` y `files_manager` de los datos iniciales

### 2.3. Componentes a Mantener

#### Core Backend:
- Sistema de autenticación (JWT, bcrypt)
- Middleware de autorización
- Gestión de usuarios (CRUD completo)
- Gestión de roles y permisos
- WebSocket server
- Manejo de errores y excepciones
- Configuración de base de datos (Sequelize)
- Sistema de email (nodemailer)

#### Core Frontend:
- Componentes de sesión (login, logout)
- Componentes de gestión de usuarios
- Componentes de gestión de permisos
- Guards de autenticación
- Servicios HTTP y WebSocket base
- Pipes y utilidades
- Layout y navegación base

#### Infrastructure:
- Docker Compose
- Nginx configuration
- Scripts de despliegue
- Configuración de TypeScript

## 3. Cambios de Nomenclatura

### 3.1. Base de Datos

**Antes:**
```sql
CREATE SCHEMA IF NOT EXISTS `y-toledo` DEFAULT CHARACTER SET utf8;
USE `y-toledo`;
```

**Después:**
```sql
CREATE SCHEMA IF NOT EXISTS `app-base` DEFAULT CHARACTER SET utf8;
USE `app-base`;
```

### 3.2. Variables de Entorno

**Antes:**
```
YTO_NODE_ENV=development
YTO_DB_NAME=y-toledo
```

**Después:**
```
APP_NODE_ENV=development
APP_DB_NAME=app-base
```

### 3.3. Package.json

**Backend - Antes:**
```json
{
  "name": "backend",
  "description": "Gestión de rutas de senderismo"
}
```

**Backend - Después:**
```json
{
  "name": "backend",
  "description": "Backend base template with authentication, authorization, and user management"
}
```

**Frontend - Antes:**
```json
{
  "name": "frontend"
}
```

**Frontend - Después:**
```json
{
  "name": "frontend",
  "description": "Frontend base template with Angular 17"
}
```

### 3.4. Archivos de Configuración

**Antes:**
```typescript
const env = process.env.YTO_NODE_ENV || 'development';
```

**Después:**
```typescript
const env = process.env.APP_NODE_ENV || 'development';
```

## 4. Diseño de Base de Datos

### 4.1. Esquema Base (Mantener)

```sql
-- Tabla de roles
CREATE TABLE IF NOT EXISTS `app-base`.`roles` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS `app-base`.`users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `role_id` INT(11) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `lastname` VARCHAR(100) NULL,
  `email` VARCHAR(100) NOT NULL,
  `username` VARCHAR(45) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `active` TINYINT(4) NULL DEFAULT '1',
  `attempts` TINYINT(1) NULL DEFAULT 0,
  `createdAt` TIMESTAMP NULL,
  `updatedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC),
  UNIQUE INDEX `user_UNIQUE` (`username` ASC),
  INDEX `fk_users_roles_idx` (`role_id` ASC),
  CONSTRAINT `fk_users_roles`
    FOREIGN KEY (`role_id`)
    REFERENCES `app-base`.`roles` (`id`)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8;

-- Tabla de permisos
CREATE TABLE IF NOT EXISTS `app-base`.`permissions` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `detail` VARCHAR(100) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC)
) ENGINE = InnoDB;

-- Tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS `app-base`.`role_has_permission` (
  `permissions_id` INT(11) NOT NULL,
  `roles_id` INT(11) NOT NULL,
  `reading` TINYINT(1) NULL DEFAULT 0,
  `writing` TINYINT(1) NULL DEFAULT 0,
  INDEX `fk_role_has_permission_permissions1_idx` (`permissions_id` ASC),
  INDEX `fk_role_has_permission_roles1_idx` (`roles_id` ASC),
  CONSTRAINT `fk_role_has_permission_permissions1`
    FOREIGN KEY (`permissions_id`)
    REFERENCES `app-base`.`permissions` (`id`),
  CONSTRAINT `fk_role_has_permission_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `app-base`.`roles` (`id`)
) ENGINE = InnoDB;
```

### 4.2. Datos Iniciales

```sql
-- Roles básicos
INSERT INTO `app-base`.`roles` (`id`, `name`) VALUES 
  (DEFAULT, 'Administrador'),
  (DEFAULT, 'Usuario'),
  (DEFAULT, 'Invitado');

-- Usuario administrador por defecto
-- Password: 123qwe (hash bcrypt)
INSERT INTO `app-base`.`users` 
  (`id`, `name`, `lastname`, `email`, `username`, `password`, `active`, `role_id`) 
VALUES 
  (DEFAULT, 'Administrador', '', 'admin@example.com', 'admin', 
   '$2b$10$1WuyQJGknupSkv6SzRloK.EwvXsd3AHprSj5P39zq4PXk1u5jtAty', 1, 1);

-- Permisos genéricos
INSERT INTO `app-base`.`permissions` (`id`, `name`, `detail`) VALUES 
  (DEFAULT, 'permissions_manager', 'Gestión de permisos'),
  (DEFAULT, 'users_manager', 'Gestión de usuarios');

-- Asignar todos los permisos al rol Administrador
INSERT INTO `app-base`.`role_has_permission` 
  (`permissions_id`, `roles_id`, `reading`, `writing`) 
VALUES 
  (1, 1, 1, 1),
  (2, 1, 1, 1);
```

## 5. Diseño de Componentes Frontend

### 5.1. Componente Home Genérico

Crear un componente home/dashboard básico que sirva como punto de partida:

```typescript
// home.component.ts
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  user: any;

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getIdentity();
  }
}
```

```html
<!-- home.component.html -->
<div class="home-container">
  <h1>Bienvenido al Sistema</h1>
  <p>Usuario: {{ user?.name }} {{ user?.lastname }}</p>
  <p>Rol: {{ user?.role?.name }}</p>
  
  <div class="info-card">
    <h2>Plantilla Base de Proyecto</h2>
    <p>Esta es una plantilla base que incluye:</p>
    <ul>
      <li>Sistema de autenticación y autorización</li>
      <li>Gestión de usuarios, roles y permisos</li>
      <li>Comunicación en tiempo real con WebSocket</li>
    </ul>
    <p>Comienza agregando tus propios módulos de negocio.</p>
  </div>
</div>
```

### 5.2. Rutas de Navegación Simplificadas

```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'permissions', component: PermissionsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/home' }
];
```

## 6. Documentación a Crear

### 6.1. README.md Principal

Estructura:
- Descripción de la plantilla
- Tecnologías incluidas
- Características principales
- Guía de inicio rápido
- Estructura del proyecto
- Comandos útiles
- Próximos pasos

### 6.2. Getting Started Guide

Contenido:
- Requisitos previos
- Instalación paso a paso
- Configuración de base de datos
- Variables de entorno
- Primer despliegue
- Verificación de instalación

### 6.3. Customization Guide

Contenido:
- Cómo renombrar el proyecto
- Cómo cambiar el nombre de la base de datos
- Cómo personalizar el tema/estilos
- Cómo configurar email
- Cómo agregar nuevos roles y permisos

### 6.4. Adding Modules Guide

Contenido:
- Estructura de un módulo
- Crear modelo en backend
- Crear servicio en backend
- Crear controlador en backend
- Crear modelo en frontend
- Crear componente en frontend
- Crear servicio WebSocket
- Agregar rutas de navegación
- Agregar permisos específicos
- Ejemplo completo: módulo de productos

### 6.5. Architecture Documentation

Contenido:
- Diagrama de arquitectura
- Flujo de autenticación
- Flujo de autorización
- Comunicación WebSocket
- Gestión de archivos
- Manejo de errores
- Patrones de diseño utilizados

## 7. Carpeta de Ejemplos

### 7.1. Módulo de Rutas como Ejemplo

Mover todo el código de rutas a `database/examples/routes-module/`:

```
database/examples/routes-module/
├── backend/
│   ├── models/
│   │   └── route.model.ts
│   ├── controllers/
│   │   └── route.controller.ts
│   ├── services/
│   │   ├── route.bll.ts
│   │   └── route.dal.ts
│   └── README.md
├── frontend/
│   ├── components/
│   │   └── routes/
│   ├── models/
│   │   └── route.model.ts
│   ├── services/
│   │   └── route.service.ts
│   └── README.md
├── database/
│   └── routes-table.sql
└── README.md (explicando cómo usar este ejemplo)
```

## 8. Configuración Docker

### 8.1. Docker Compose Actualizado

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: app-base-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: app-base
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./database/schema.sql:/docker-entrypoint-initdb.d/schema.sql

  backend:
    build: ./backend
    container_name: app-base-backend
    environment:
      APP_NODE_ENV: production
      APP_DB_HOST: mysql
      APP_DB_NAME: app-base
    ports:
      - "3000:3000"
    depends_on:
      - mysql
    volumes:
      - ./backend:/app
      - /app/node_modules

  frontend:
    build: ./frontend
    container_name: app-base-frontend
    ports:
      - "4200:80"
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: app-base-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  mysql-data:
```

## 9. Archivos de Configuración

### 9.1. Backend .env Template

Crear `.env.template`:

```env
# Application
APP_NODE_ENV=development
APP_PORT=3000

# Database
APP_DB_HOST=localhost
APP_DB_PORT=3306
APP_DB_NAME=app-base
APP_DB_USER=root
APP_DB_PASSWORD=root

# JWT
APP_JWT_SECRET=your-secret-key-change-this
APP_JWT_EXPIRES_IN=24h

# Email (opcional)
APP_EMAIL_HOST=smtp.gmail.com
APP_EMAIL_PORT=587
APP_EMAIL_USER=your-email@example.com
APP_EMAIL_PASSWORD=your-password
```

### 9.2. Frontend Environment Template

Actualizar `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  socketUrl: 'http://localhost:3000',
  appName: 'Project Base Template',
  version: '1.0.0'
};
```

## 10. Plan de Migración

### Fase 1: Preparación
1. Crear backup completo del proyecto actual
2. Crear rama nueva en git: `feature/base-template`
3. Documentar estado actual

### Fase 2: Eliminación de Código Específico
1. Eliminar modelos de rutas (backend y frontend)
2. Eliminar controladores de rutas
3. Eliminar servicios de rutas
4. Eliminar componentes de rutas en frontend
5. Eliminar guards específicos de rutas
6. Limpiar rutas de navegación

### Fase 3: Renombrado
1. Renombrar base de datos en SQL
2. Actualizar variables de entorno
3. Actualizar package.json
4. Actualizar configuraciones
5. Actualizar referencias en código

### Fase 4: Reorganización
1. Mover código de rutas a carpeta examples
2. Reorganizar estructura de carpetas
3. Limpiar archivos innecesarios

### Fase 5: Documentación
1. Crear README.md principal
2. Crear guías de uso
3. Crear documentación de arquitectura
4. Documentar ejemplos

### Fase 6: Testing
1. Probar autenticación
2. Probar gestión de usuarios
3. Probar gestión de permisos
4. Probar gestión de archivos
5. Probar despliegue con Docker

### Fase 7: Finalización
1. Revisar toda la documentación
2. Crear release notes
3. Etiquetar versión en git
4. Publicar plantilla

## 11. Correctness Properties

### Property 1: Integridad de Autenticación
**Validates: Requirements 4.1**

Para cualquier usuario válido en el sistema:
- Si las credenciales son correctas, el login debe retornar un token JWT válido
- Si las credenciales son incorrectas, el login debe fallar con error 401
- El token debe contener la información del usuario y sus permisos
- El token debe expirar según la configuración

```typescript
// Propiedad: Login con credenciales válidas siempre retorna token
property('valid credentials return JWT token', 
  arbitraryValidUser(), 
  (user) => {
    const result = authService.login(user.username, user.password);
    return result.token !== null && 
           result.token !== undefined &&
           isValidJWT(result.token);
  }
);
```

### Property 2: Autorización por Permisos
**Validates: Requirements 4.2, 4.5**

Para cualquier operación protegida:
- Si el usuario tiene el permiso requerido, la operación debe permitirse
- Si el usuario no tiene el permiso, la operación debe denegarse con error 403
- Los permisos deben verificarse en cada request

```typescript
// Propiedad: Usuarios sin permiso no pueden acceder a recursos protegidos
property('unauthorized users cannot access protected resources',
  arbitraryUser(),
  arbitraryProtectedResource(),
  (user, resource) => {
    if (!user.hasPermission(resource.requiredPermission)) {
      const result = attemptAccess(user, resource);
      return result.status === 403;
    }
    return true;
  }
);
```

### Property 3: Gestión de Usuarios CRUD
**Validates: Requirements 4.3**

Para cualquier operación CRUD de usuarios:
- Crear usuario con datos válidos debe persistir en BD
- Leer usuario debe retornar datos correctos
- Actualizar usuario debe reflejar cambios
- Eliminar usuario debe removerlo de BD
- Operaciones deben ser atómicas (transacciones)

```typescript
// Propiedad: Usuario creado puede ser recuperado con mismos datos
property('created user can be retrieved with same data',
  arbitraryUserData(),
  async (userData) => {
    const created = await userService.create(userData);
    const retrieved = await userService.getById(created.id);
    
    return retrieved.name === userData.name &&
           retrieved.email === userData.email &&
           retrieved.username === userData.username;
  }
);
```

### Property 4: Comunicación WebSocket
**Validates: Requirements 4.4**

Para cualquier evento WebSocket:
- Eventos emitidos deben ser recibidos por clientes conectados
- Broadcast debe llegar a todos excepto emisor
- Desconexión debe limpiar recursos
- Reconexión debe restaurar estado

```typescript
// Propiedad: Evento broadcast llega a todos los clientes conectados excepto emisor
property('broadcast reaches all connected clients except sender',
  arbitraryConnectedClients(),
  arbitraryEvent(),
  (clients, event) => {
    const sender = clients[0];
    const receivers = clients.slice(1);
    
    sender.broadcast(event);
    
    return receivers.every(client => client.receivedEvent(event)) &&
           !sender.receivedEvent(event);
  }
);
```

### Property 5: Idempotencia de Operaciones
**Validates: Requirements RNF-3**

Para operaciones que deben ser idempotentes:
- Múltiples llamadas con mismos parámetros producen mismo resultado
- Estado del sistema es consistente después de operaciones repetidas

```typescript
// Propiedad: Actualizar usuario múltiples veces con mismos datos es idempotente
property('updating user multiple times is idempotent',
  arbitraryUser(),
  arbitraryUserUpdateData(),
  async (user, updateData) => {
    const result1 = await userService.update(user.id, updateData);
    const result2 = await userService.update(user.id, updateData);
    const result3 = await userService.update(user.id, updateData);
    
    return deepEqual(result1, result2) && deepEqual(result2, result3);
  }
);
```

## 12. Consideraciones de Seguridad

### 12.1. Credenciales
- No incluir credenciales reales en archivos de configuración
- Usar variables de entorno para datos sensibles
- Documentar cómo configurar credenciales de forma segura

### 12.2. JWT
- Usar secreto fuerte y único por proyecto
- Configurar expiración apropiada
- Implementar refresh tokens si es necesario

### 12.3. Base de Datos
- Cambiar contraseña de admin por defecto
- Usar contraseñas fuertes en producción
- Configurar acceso restringido a BD

## 13. Testing Strategy

### 13.1. Tests Unitarios
- Servicios de autenticación
- Servicios de usuarios
- Servicios de permisos
- Utilidades y helpers

### 13.2. Tests de Integración
- Flujo completo de login
- CRUD de usuarios
- Sistema de permisos
- Gestión de archivos

### 13.3. Tests E2E
- Login y logout
- Navegación entre páginas
- Operaciones CRUD desde UI
- Manejo de errores

### 13.4. Property-Based Tests
- Implementar las 5 propiedades definidas
- Usar generadores de datos aleatorios
- Ejecutar múltiples iteraciones
- Documentar casos de fallo

## 14. Métricas de Éxito

- ✅ Tiempo de setup < 30 minutos
- ✅ Todos los tests pasan
- ✅ Documentación completa y clara
- ✅ Sin referencias a dominio específico
- ✅ Docker deployment funcional
- ✅ Ejemplo de módulo incluido
- ✅ Guías de personalización disponibles

## 15. Mantenimiento Futuro

### 15.1. Versionado
- Usar semantic versioning
- Documentar breaking changes
- Mantener changelog

### 15.2. Actualizaciones
- Revisar dependencias periódicamente
- Actualizar documentación
- Agregar nuevos ejemplos según necesidad

### 15.3. Soporte
- Documentar issues comunes
- Crear FAQ
- Proporcionar ejemplos adicionales
