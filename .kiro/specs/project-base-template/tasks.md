# Tasks: Conversión a Plantilla Base de Proyecto

## 1. Preparación y Backup
- [ ] 1.1 Crear backup completo del proyecto actual
- [ ] 1.2 Crear rama git `feature/base-template`
- [ ] 1.3 Documentar estado actual del proyecto
- [ ] 1.4 Verificar que el proyecto actual funciona correctamente

## 2. Eliminación de Código Específico del Dominio - Backend

### 2.1 Eliminar Modelos de Rutas
- [ ] 2.1.1 Eliminar archivo `1_Project/1_Sources/backend/models/route.model.ts`
- [ ] 2.1.2 Actualizar `1_Project/1_Sources/backend/models/index.ts` para remover importación de route.model

### 2.2 Eliminar Controladores de Rutas
- [ ] 2.2.1 Eliminar archivo `1_Project/1_Sources/backend/controllers/ws/route.controller.ts`
- [ ] 2.2.2 Actualizar `1_Project/1_Sources/backend/server/server.ts` para remover rutas de route.controller

### 2.3 Eliminar Servicios de Rutas
- [ ] 2.3.1 Eliminar carpeta completa `1_Project/1_Sources/backend/services/route/`
- [ ] 2.3.2 Verificar que no hay importaciones de route service en otros archivos

### 2.4 Eliminar Sistema de Gestión de Archivos
- [ ] 2.4.1 Eliminar carpeta completa `1_Project/1_Sources/backend/services/file/`
- [ ] 2.4.2 Eliminar archivo `1_Project/1_Sources/backend/controllers/ws/file-management.controller.ts`
- [ ] 2.4.3 Eliminar archivo `1_Project/1_Sources/backend/types/file-attachment.types.ts`
- [ ] 2.4.4 Eliminar archivo `1_Project/1_Sources/backend/utils/fileValidation.ts`
- [ ] 2.4.5 Eliminar carpeta `1_Project/1_Sources/backend/data/files/`
- [ ] 2.4.6 Actualizar `server/server.ts` para remover rutas de file-management

### 2.5 Actualizar Configuración Backend
- [ ] 2.5.1 Editar `1_Project/1_Sources/backend/config/config.ts` para remover `permission_routes_manager` y `permission_files_manager`
- [ ] 2.5.2 Actualizar referencias a variables de entorno de `YTO_` a `APP_`

## 3. Eliminación de Código Específico del Dominio - Frontend

### 3.1 Eliminar Componentes de Rutas
- [ ] 3.1.1 Eliminar carpeta completa `1_Project/1_Sources/frontend/src/app/components/routes/`
- [ ] 3.1.2 Actualizar `app.module.ts` para remover declaraciones de componentes de rutas

### 3.2 Eliminar Modelos de Rutas y Archivos
- [ ] 3.2.1 Eliminar archivo `1_Project/1_Sources/frontend/src/app/models/route.model.ts`
- [ ] 3.2.2 Eliminar archivo `1_Project/1_Sources/frontend/src/app/models/file-attachment.model.ts`
- [ ] 3.2.3 Verificar que no hay importaciones de RouteModel o FileAttachment en otros archivos

### 3.3 Eliminar Servicios de Rutas y Archivos
- [ ] 3.3.1 Eliminar servicios WebSocket relacionados con rutas en `services/websockets/`
- [ ] 3.3.2 Eliminar servicios HTTP relacionados con archivos si existen
- [ ] 3.3.3 Actualizar `service.module.ts` si es necesario

### 3.4 Eliminar Componentes de Archivos
- [ ] 3.4.1 Eliminar carpeta completa `1_Project/1_Sources/frontend/src/app/components/files/` si existe
- [ ] 3.4.2 Actualizar `app.module.ts` para remover declaraciones de componentes de archivos

### 3.5 Eliminar Guards de Rutas
- [ ] 3.5.1 Eliminar archivo `1_Project/1_Sources/frontend/src/app/guards/routes-manager.guard.ts`
- [ ] 3.5.2 Actualizar `app-routing.module.ts` para remover referencias al guard

### 3.6 Actualizar Rutas de Navegación
- [ ] 3.6.1 Editar `app-routing.module.ts` para remover rutas relacionadas con routes y files
- [ ] 3.6.2 Actualizar menú de navegación para remover enlaces a rutas y archivos

## 4. Eliminación de Código Específico del Dominio - Base de Datos

### 4.1 Actualizar Esquema SQL
- [ ] 4.1.1 Editar `1_Project/4_Database/y-toledo.sql` para remover tabla `routes`
- [ ] 4.1.2 Remover permisos `routes_manager` y `files_manager` de datos iniciales
- [ ] 4.1.3 Remover inserts de role_has_permission relacionados con routes_manager y files_manager
- [ ] 4.1.4 Actualizar inserts para que solo incluyan permissions_manager y users_manager

### 4.2 Mover Migraciones de Rutas
- [ ] 4.2.1 Crear carpeta `1_Project/4_Database/examples/routes-module/migrations/`
- [ ] 4.2.2 Mover archivos de migraciones de rutas a la carpeta de ejemplos
- [ ] 4.2.3 Actualizar README de migraciones

## 5. Renombrado de Proyecto y Configuraciones

### 5.1 Renombrar Base de Datos
- [ ] 5.1.1 Renombrar archivo `y-toledo.sql` a `schema.sql`
- [ ] 5.1.2 Cambiar nombre de schema de `y-toledo` a `app-base` en SQL
- [ ] 5.1.3 Actualizar todas las referencias `USE y-toledo` a `USE app-base`

### 5.2 Actualizar Variables de Entorno Backend
- [ ] 5.2.1 Crear archivo `.env.template` con variables genéricas
- [ ] 5.2.2 Actualizar `.env` para usar prefijo `APP_` en lugar de `YTO_`
- [ ] 5.2.3 Actualizar `.env.production` con mismo prefijo
- [ ] 5.2.4 Buscar y reemplazar todas las referencias `process.env.YTO_` por `process.env.APP_`

### 5.3 Actualizar Package.json
- [ ] 5.3.1 Editar `backend/package.json`:
  - Cambiar description a genérica
  - Actualizar name si es necesario
- [ ] 5.3.2 Editar `frontend/package.json`:
  - Cambiar description a genérica
  - Actualizar name si es necesario

### 5.4 Actualizar Configuración Frontend
- [ ] 5.4.1 Editar `frontend/src/environments/environment.ts`:
  - Cambiar appName a genérico
  - Actualizar configuraciones
- [ ] 5.4.2 Editar `frontend/src/environments/environment.prod.ts` de igual manera

### 5.5 Actualizar Docker Compose
- [ ] 5.5.1 Editar `docker-compose.yml`:
  - Cambiar nombres de contenedores de `y-toledo-*` a `app-base-*`
  - Actualizar variables de entorno
  - Actualizar nombre de base de datos
- [ ] 5.5.2 Actualizar referencias en archivos de configuración de Docker

### 5.6 Actualizar Nginx
- [ ] 5.6.1 Revisar `nginx/nginx.conf` para referencias específicas
- [ ] 5.6.2 Actualizar nombres de servidor si es necesario

## 6. Crear Componente Home Genérico

### 6.1 Crear Componente Home
- [ ] 6.1.1 Crear carpeta `frontend/src/app/components/home/`
- [ ] 6.1.2 Crear `home.component.ts` con lógica básica
- [ ] 6.1.3 Crear `home.component.html` con template genérico
- [ ] 6.1.4 Crear `home.component.css` con estilos básicos
- [ ] 6.1.5 Agregar componente a `app.module.ts`
- [ ] 6.1.6 Agregar ruta `/home` en `app-routing.module.ts`
- [ ] 6.1.7 Configurar `/home` como ruta por defecto

## 7. Reorganizar Estructura de Carpetas [OMITIDA - No se ejecutará]

### 7.1 Crear Carpeta de Ejemplos [OMITIDA]
- [ ] 7.1.1 Crear estructura `1_Project/4_Database/examples/routes-module/`
- [ ] 7.1.2 Crear subcarpetas: `backend/`, `frontend/`, `database/`

### 7.2 Mover Código de Rutas a Ejemplos [OMITIDA]
- [ ] 7.2.1 Copiar `route.model.ts` (backend) a `examples/routes-module/backend/models/`
- [ ] 7.2.2 Copiar `route.controller.ts` a `examples/routes-module/backend/controllers/`
- [ ] 7.2.3 Copiar servicios de rutas a `examples/routes-module/backend/services/`
- [ ] 7.2.4 Copiar componentes de rutas (frontend) a `examples/routes-module/frontend/components/`
- [ ] 7.2.5 Copiar `route.model.ts` (frontend) a `examples/routes-module/frontend/models/`
- [ ] 7.2.6 Copiar servicios de rutas (frontend) a `examples/routes-module/frontend/services/`
- [ ] 7.2.7 Crear SQL con tabla routes en `examples/routes-module/database/routes-table.sql`

### 7.3 Crear README para Ejemplos [OMITIDA]
- [ ] 7.3.1 Crear `examples/routes-module/README.md` explicando el módulo
- [ ] 7.3.2 Crear `examples/routes-module/backend/README.md` con instrucciones backend
- [ ] 7.3.3 Crear `examples/routes-module/frontend/README.md` con instrucciones frontend

### 7.4 Renombrar Carpetas Principales [OMITIDA]
- [ ] 7.4.1 Considerar renombrar `1_Project` a nombre más descriptivo (opcional)
- [ ] 7.4.2 Actualizar referencias en documentación

## 8. Crear Documentación Principal

### 8.1 Actualizar README Principal
- [ ] 8.1.1 Editar `README.md` en raíz del proyecto:
  - Cambiar título a "Project Base Template"
  - Actualizar descripción
  - Listar características incluidas
  - Agregar guía de inicio rápido
  - Agregar estructura del proyecto
  - Agregar comandos útiles
  - Agregar sección "Próximos Pasos"

### 8.2 Crear Getting Started Guide
- [ ] 8.2.1 Crear `1_Project/2_Docs/guides/getting-started.md`
- [ ] 8.2.2 Documentar requisitos previos
- [ ] 8.2.3 Documentar instalación paso a paso
- [ ] 8.2.4 Documentar configuración de base de datos
- [ ] 8.2.5 Documentar variables de entorno
- [ ] 8.2.6 Documentar primer despliegue
- [ ] 8.2.7 Documentar verificación de instalación

### 8.3 Crear Customization Guide
- [ ] 8.3.1 Crear `1_Project/2_Docs/guides/customization-guide.md`
- [ ] 8.3.2 Documentar cómo renombrar el proyecto
- [ ] 8.3.3 Documentar cómo cambiar nombre de BD
- [ ] 8.3.4 Documentar cómo personalizar tema/estilos
- [ ] 8.3.5 Documentar cómo configurar email
- [ ] 8.3.6 Documentar cómo agregar nuevos roles y permisos

### 8.4 Crear Adding Modules Guide
- [ ] 8.4.1 Crear `1_Project/2_Docs/guides/adding-modules.md`
- [ ] 8.4.2 Documentar estructura de un módulo
- [ ] 8.4.3 Documentar creación de modelo backend
- [ ] 8.4.4 Documentar creación de servicio backend
- [ ] 8.4.5 Documentar creación de controlador backend
- [ ] 8.4.6 Documentar creación de modelo frontend
- [ ] 8.4.7 Documentar creación de componente frontend
- [ ] 8.4.8 Documentar creación de servicio WebSocket
- [ ] 8.4.9 Documentar cómo agregar rutas de navegación
- [ ] 8.4.10 Documentar cómo agregar permisos específicos
- [ ] 8.4.11 Incluir ejemplo completo: módulo de productos

### 8.5 Crear Architecture Documentation
- [ ] 8.5.1 Crear `1_Project/2_Docs/architecture/overview.md`
- [ ] 8.5.2 Crear diagrama de arquitectura
- [ ] 8.5.3 Documentar flujo de autenticación
- [ ] 8.5.4 Documentar flujo de autorización
- [ ] 8.5.5 Documentar comunicación WebSocket
- [ ] 8.5.6 Documentar gestión de archivos
- [ ] 8.5.7 Documentar manejo de errores
- [ ] 8.5.8 Documentar patrones de diseño utilizados

### 8.6 Actualizar Documentación Técnica Existente
- [ ] 8.6.1 Revisar archivos en `2_Docs/1_Technical/`
- [ ] 8.6.2 Actualizar referencias a Y-Toledo
- [ ] 8.6.3 Actualizar nombres de contenedores Docker
- [ ] 8.6.4 Actualizar comandos con nuevos nombres

## 9. Limpiar Archivos Innecesarios

### 9.1 Eliminar Archivos Específicos del Dominio
- [ ] 9.1.1 Revisar carpeta `backend/data/logs/` y limpiar logs de ejemplo
- [ ] 9.1.2 Revisar carpeta `frontend/src/assets/images/` y remover logos específicos de Y-Toledo
- [ ] 9.1.3 Mantener solo imágenes genéricas o placeholders

### 9.2 Limpiar Archivos de Documentación
- [ ] 9.2.1 Revisar `2_Docs/2_Issues/` y limpiar issues específicos
- [ ] 9.2.2 Revisar `2_Docs/3_Meetings/` y limpiar actas específicas
- [ ] 9.2.3 Mantener estructura de carpetas vacías con .gitkeep

### 9.3 Limpiar Archivos de Base de Datos
- [ ] 9.3.1 Eliminar `4_Database/script/00-routes.sql` (ya movido a ejemplos)
- [ ] 9.3.2 Eliminar `4_Database/IMPLEMENTATION_SUMMARY_TASK_1.md`
- [ ] 9.3.3 Actualizar o eliminar `4_Database/y-toledo.png` (diagrama)

## 10. Testing y Verificación

### 10.1 Testing Backend
- [ ] 10.1.1 Verificar que el backend compila sin errores TypeScript
- [ ] 10.1.2 Probar endpoint de login
- [ ] 10.1.3 Probar CRUD de usuarios
- [ ] 10.1.4 Probar gestión de roles y permisos
- [ ] 10.1.5 Verificar que no hay referencias a rutas o archivos en logs

### 10.2 Testing Frontend
- [ ] 10.2.1 Verificar que el frontend compila sin errores
- [ ] 10.2.2 Probar login desde UI
- [ ] 10.2.3 Probar navegación a home
- [ ] 10.2.4 Probar gestión de usuarios desde UI
- [ ] 10.2.5 Probar gestión de permisos desde UI
- [ ] 10.2.6 Verificar que no hay enlaces rotos

### 10.3 Testing Base de Datos
- [ ] 10.3.1 Ejecutar script SQL en BD limpia
- [ ] 10.3.2 Verificar que todas las tablas se crean correctamente
- [ ] 10.3.3 Verificar datos iniciales (admin, roles, permisos)
- [ ] 10.3.4 Verificar que no existe tabla routes

### 10.4 Testing Docker
- [ ] 10.4.1 Construir imágenes Docker
- [ ] 10.4.2 Levantar contenedores con docker-compose
- [ ] 10.4.3 Verificar conectividad entre servicios
- [ ] 10.4.4 Probar aplicación completa en Docker
- [ ] 10.4.5 Verificar logs de contenedores

### 10.5 Testing de Integración
- [ ] 10.5.1 Probar flujo completo: login → home → users → logout
- [ ] 10.5.2 Probar creación de usuario con diferentes roles
- [ ] 10.5.3 Probar sistema de permisos (acceso denegado)
- [ ] 10.5.4 Probar comunicación WebSocket en tiempo real

## 11. Property-Based Testing

### 11.1 Setup de PBT
- [ ] 11.1.1 Instalar librería de PBT (fast-check para TypeScript)
- [ ] 11.1.2 Configurar framework de testing
- [ ] 11.1.3 Crear carpeta `backend/tests/properties/`
- [ ] 11.1.4 Crear carpeta `frontend/tests/properties/`

### 11.2 Implementar Property Tests - Autenticación
- [ ] 11.2.1 Crear generador de usuarios válidos
- [ ] 11.2.2 Implementar property: "valid credentials return JWT token"
  - **Validates: Requirements 4.1**
- [ ] 11.2.3 Ejecutar test y verificar que pasa
- [ ] 11.2.4 Documentar resultados

### 11.3 Implementar Property Tests - Autorización
- [ ] 11.3.1 Crear generador de usuarios con diferentes permisos
- [ ] 11.3.2 Crear generador de recursos protegidos
- [ ] 11.3.3 Implementar property: "unauthorized users cannot access protected resources"
  - **Validates: Requirements 4.2, 4.5**
- [ ] 11.3.4 Ejecutar test y verificar que pasa
- [ ] 11.3.5 Documentar resultados

### 11.4 Implementar Property Tests - CRUD Usuarios
- [ ] 11.4.1 Crear generador de datos de usuario
- [ ] 11.4.2 Implementar property: "created user can be retrieved with same data"
  - **Validates: Requirements 4.3**
- [ ] 11.4.3 Ejecutar test y verificar que pasa
- [ ] 11.4.4 Documentar resultados

### 11.5 Implementar Property Tests - WebSocket
- [ ] 11.5.1 Crear generador de clientes conectados
- [ ] 11.5.2 Crear generador de eventos
- [ ] 11.5.3 Implementar property: "broadcast reaches all connected clients except sender"
  - **Validates: Requirements 4.4**
- [ ] 11.5.4 Ejecutar test y verificar que pasa
- [ ] 11.5.5 Documentar resultados

### 11.6 Implementar Property Tests - Idempotencia
- [ ] 11.6.1 Implementar property: "updating user multiple times is idempotent"
  - **Validates: Requirements RNF-3**
- [ ] 11.6.2 Ejecutar test y verificar que pasa
- [ ] 11.6.3 Documentar resultados

## 12. Finalización y Release

### 12.1 Revisión Final
- [ ] 12.1.1 Revisar toda la documentación
- [ ] 12.1.2 Verificar que no quedan referencias a Y-Toledo
- [ ] 12.1.3 Verificar que no quedan referencias a rutas de senderismo o gestión de archivos
- [ ] 12.1.4 Revisar que todos los tests pasan
- [ ] 12.1.5 Revisar que la aplicación funciona end-to-end

### 12.2 Crear Release Notes
- [ ] 12.2.1 Crear archivo `CHANGELOG.md`
- [ ] 12.2.2 Documentar versión 1.0.0
- [ ] 12.2.3 Listar características incluidas
- [ ] 12.2.4 Listar componentes eliminados
- [ ] 12.2.5 Documentar breaking changes si aplica

### 12.3 Git y Versionado
- [ ] 12.3.1 Hacer commit final de la rama feature
- [ ] 12.3.2 Crear pull request para revisión
- [ ] 12.3.3 Merge a rama principal
- [ ] 12.3.4 Crear tag `v1.0.0`
- [ ] 12.3.5 Crear release en GitHub/GitLab

### 12.4 Publicación
- [ ] 12.4.1 Crear repositorio para la plantilla
- [ ] 12.4.2 Push del código a repositorio
- [ ] 12.4.3 Configurar README para GitHub/GitLab
- [ ] 12.4.4 Agregar badges (build status, version, etc.)
- [ ] 12.4.5 Publicar release notes

### 12.5 Documentación Final
- [ ] 12.5.1 Crear archivo `CONTRIBUTING.md` si se acepta contribuciones
- [ ] 12.5.2 Crear archivo `LICENSE` con licencia apropiada
- [ ] 12.5.3 Actualizar README con enlaces a documentación
- [ ] 12.5.4 Crear wiki o GitHub Pages si es necesario

## 13. Post-Release

### 13.1 Verificación Post-Release
- [ ] 13.1.1 Clonar repositorio en máquina limpia
- [ ] 13.1.2 Seguir guía de getting started
- [ ] 13.1.3 Verificar que setup funciona en < 30 minutos
- [ ] 13.1.4 Documentar cualquier problema encontrado

### 13.2 Crear Proyecto de Prueba
- [ ] 13.2.1 Usar la plantilla para crear un proyecto de prueba
- [ ] 13.2.2 Agregar un módulo de ejemplo (ej: productos)
- [ ] 13.2.3 Documentar el proceso
- [ ] 13.2.4 Identificar mejoras necesarias

### 13.3 Feedback y Mejoras
- [ ] 13.3.1 Recopilar feedback inicial
- [ ] 13.3.2 Crear issues para mejoras identificadas
- [ ] 13.3.3 Priorizar mejoras
- [ ] 13.3.4 Planificar versión 1.1.0

## Notas Importantes

- Hacer commits frecuentes durante el proceso
- Probar después de cada fase importante
- Mantener backup del proyecto original
- Documentar cualquier decisión importante
- No apresurarse, la calidad es más importante que la velocidad
