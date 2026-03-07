# Guía Rápida de Inicio - App Base

## Requisitos Previos
- Node.js instalado
- MySQL instalado y corriendo
- DBeaver (opcional, para gestión de base de datos)

## Paso 1: Crear la Base de Datos

### Opción A: Usando DBeaver
1. Abre DBeaver
2. Conéctate a MySQL (usuario: root)
3. Abre el archivo `1_Project/4_Database/schema.sql`
4. Ejecuta el script completo

### Opción B: Usando terminal
```bash
mysql -u root -p < 1_Project/4_Database/schema.sql
```

### Verificar la instalación
Ejecuta el script de verificación:
```bash
mysql -u root -p < 1_Project/4_Database/verify_database.sql
```

Deberías ver:
- 4 tablas creadas: roles, users, permissions, role_has_permission
- 3 roles: Administrador, Usuario, Invitado
- 1 usuario admin
- 2 permisos: permissions_manager, users_manager

## Paso 2: Configurar el Backend

### Instalar dependencias
```bash
cd 1_Project/1_Sources/backend
npm install
```

### Compilar TypeScript
```bash
tsc -w
```

### Iniciar el servidor
```bash
npm start
```

El backend debería estar corriendo en: **http://localhost:5555**

## Paso 3: Configurar el Frontend

### Instalar dependencias
```bash
cd 1_Project/1_Sources/frontend
npm install
```

### Iniciar el servidor de desarrollo
```bash
npm start
```

El frontend debería abrirse automáticamente en: **http://localhost:4200**

## Paso 4: Probar la Aplicación

### Credenciales de acceso
- **Usuario**: admin
- **Contraseña**: 123qwe (la contraseña por defecto en el hash)

### Funcionalidades disponibles
1. **Login**: Autenticación de usuarios
2. **Gestión de Usuarios**: Crear, editar, eliminar usuarios
3. **Gestión de Permisos**: Asignar permisos a roles
4. **WebSocket**: Comunicación en tiempo real


## Estructura del Proyecto

```
1_Project/
├── 1_Sources/
│   ├── backend/          # API Node.js + Express + Socket.io
│   ├── frontend/         # Angular 17
│   ├── nginx/            # Configuración Nginx
│   └── docker-compose.yml
├── 2_Docs/              # Documentación
├── 3_Resources/         # Recursos adicionales
└── 4_Database/          # Scripts SQL
    ├── schema.sql       # Schema principal
    ├── verify_database.sql  # Verificación
    └── examples/        # Módulos de ejemplo
```

## Próximos Pasos

Una vez que la aplicación esté funcionando:
1. Cambiar la contraseña del usuario admin
2. Personalizar el nombre de la aplicación
3. Configurar el servicio de email
4. Agregar tus propios módulos

## Comandos Útiles

### Backend
```bash
# Ver logs
tail -f data/logs/*.log
```

### Frontend
```bash
# Linting
npm run lint
```

### Base de Datos
```bash
# Conectar a MySQL
mysql -u root -p

# Usar la base de datos
USE `app-base`;

# Ver tablas
SHOW TABLES;

# Backup
mysqldump -u root -p app-base > backup.sql

# Restaurar
mysql -u root -p app-base < backup.sql
```
