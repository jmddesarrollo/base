# Requisitos: Conversión a Plantilla Base de Proyecto

## 1. Visión General

Convertir el proyecto actual de gestión de rutas de senderismo "Y-Toledo" en una plantilla base reutilizable que pueda servir como punto de partida para cualquier nuevo proyecto web. La plantilla debe mantener toda la infraestructura común (autenticación, autorización, gestión de usuarios, archivos) pero eliminar todo el código específico del dominio de senderismo.

## 2. Objetivos

- Crear una plantilla base limpia y genérica
- Mantener la arquitectura y patrones establecidos
- Facilitar el inicio rápido de nuevos proyectos
- Documentar claramente qué debe personalizarse en cada nuevo proyecto
- Proporcionar ejemplos de cómo extender la plantilla

## 3. Historias de Usuario

### HU-1: Como desarrollador, quiero una plantilla base sin código específico de dominio
**Criterios de aceptación:**
- 1.1. Se eliminan todos los modelos, controladores y servicios relacionados con "routes" (rutas de senderismo)
- 1.2. Se eliminan todos los componentes del frontend relacionados con rutas
- 1.3. Se elimina el sistema de gestión de archivos adjuntos (no es común a todos los proyectos)
- 1.4. Se mantiene la estructura de carpetas y arquitectura del proyecto
- 1.5. Se conservan los sistemas de autenticación, autorización y gestión de usuarios

### HU-2: Como desarrollador, quiero nombres genéricos en archivos y configuraciones
**Criterios de aceptación:**
- 2.1. El nombre de la base de datos cambia de "y-toledo" a un nombre genérico como "app-base" o "project-template"
- 2.2. Los archivos SQL se renombran de "y-toledo.sql" a "database-schema.sql"
- 2.3. Las referencias a "Y-Toledo" en documentación se reemplazan por "Project Base Template"
- 2.4. Los package.json tienen nombres y descripciones genéricas
- 2.5. Las variables de entorno tienen prefijos genéricos (no "YTO_")
- 2.6. Los archivos de configuración usan nombres genéricos

### HU-3: Como desarrollador, quiero documentación clara sobre cómo usar la plantilla
**Criterios de aceptación:**
- 3.1. Existe un README.md actualizado que explica qué es la plantilla base
- 3.2. Se documenta qué componentes están incluidos en la plantilla
- 3.3. Se proporciona una guía paso a paso para iniciar un nuevo proyecto desde la plantilla
- 3.4. Se documenta qué archivos y configuraciones deben personalizarse
- 3.5. Se incluyen ejemplos de cómo agregar nuevos módulos de dominio

### HU-4: Como desarrollador, quiero mantener la funcionalidad core intacta
**Criterios de aceptación:**
- 4.1. El sistema de autenticación (login/logout) funciona correctamente
- 4.2. El sistema de roles y permisos funciona correctamente
- 4.3. La gestión de usuarios (CRUD) funciona correctamente
- 4.4. La comunicación WebSocket funciona correctamente
- 4.5. El middleware de autorización funciona correctamente

### HU-5: Como desarrollador, quiero una estructura de base de datos limpia
**Criterios de aceptación:**
- 5.1. Se elimina la tabla "routes" del esquema de base de datos
- 5.2. Se mantienen las tablas: users, roles, permissions, role_has_permission
- 5.3. El script SQL incluye datos de ejemplo mínimos (admin user, roles básicos)
- 5.4. Se documenta cómo agregar nuevas tablas al esquema
- 5.5. Las migraciones específicas de rutas se mueven a una carpeta de ejemplos

### HU-6: Como desarrollador, quiero una estructura de proyecto organizada
**Criterios de aceptación:**
- 6.1. La carpeta del proyecto se renombra de "1_Project" a algo más genérico
- 6.2. Se mantiene la estructura de carpetas: Sources, Docs, Resources, Database
- 6.3. Se crea una carpeta "examples" con el código de rutas como referencia
- 6.4. Se eliminan archivos específicos del dominio (imágenes de logos específicos, etc.)
- 6.5. Se mantienen archivos de configuración genéricos (nginx, docker-compose)

### HU-7: Como desarrollador, quiero permisos genéricos en lugar de específicos
**Criterios de aceptación:**
- 7.1. Se eliminan permisos específicos como "routes_manager" y "files_manager"
- 7.2. Se mantienen permisos genéricos: permissions_manager, users_manager
- 7.3. Se documenta cómo agregar nuevos permisos para módulos específicos
- 7.4. El sistema de permisos sigue funcionando con los permisos genéricos

### HU-8: Como desarrollador, quiero un frontend limpio y extensible
**Criterios de aceptación:**
- 8.1. Se eliminan componentes de rutas y archivos del frontend
- 8.2. Se mantiene el layout base, navegación y componentes de sesión
- 8.3. Se mantienen los componentes de gestión de usuarios y permisos
- 8.4. Se crea un componente "home" genérico o dashboard vacío
- 8.5. Se documenta cómo agregar nuevos módulos al frontend

## 4. Requisitos No Funcionales

### RNF-1: Compatibilidad
- Mantener las mismas versiones de tecnologías (Angular 17, Node 20, MySQL 8)
- Asegurar que Docker Compose funcione correctamente
- Mantener compatibilidad con los scripts de despliegue existentes

### RNF-2: Documentación
- Toda la documentación debe estar en español
- Los comentarios en código deben ser claros y explicativos
- Se debe incluir documentación de arquitectura

### RNF-3: Mantenibilidad
- El código debe seguir los mismos patrones establecidos
- La estructura debe ser fácil de entender para nuevos desarrolladores
- Los nombres deben ser descriptivos y en inglés (código) o español (documentación)

### RNF-4: Seguridad
- Mantener todas las medidas de seguridad existentes
- No incluir credenciales reales en el código
- Documentar las mejores prácticas de seguridad

## 5. Restricciones

- No cambiar la arquitectura fundamental del proyecto
- No actualizar versiones de dependencias (mantener estabilidad)
- No modificar el sistema de autenticación/autorización existente
- Mantener la compatibilidad con Docker

## 6. Dependencias

- El proyecto actual debe estar funcionando correctamente antes de la conversión
- Se debe hacer backup del proyecto original
- Se debe probar la plantilla base después de la conversión

## 7. Criterios de Éxito

- Un desarrollador puede clonar la plantilla e iniciar un nuevo proyecto en menos de 30 minutos
- Todos los sistemas core (auth, users, permissions, files) funcionan correctamente
- La documentación es clara y completa
- No quedan referencias al dominio de senderismo en el código base
- El proyecto se puede desplegar con Docker sin problemas

## 8. Fuera de Alcance

- Actualización de versiones de dependencias
- Cambios en la arquitectura del proyecto
- Implementación de nuevas funcionalidades
- Optimizaciones de rendimiento
- Cambios en el sistema de base de datos (seguir usando MySQL con Sequelize)
