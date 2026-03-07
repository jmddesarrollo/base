-- Script de verificación de la base de datos app-base
-- Ejecutar después de crear la base de datos

USE `app-base`;

-- Verificar que las tablas existen
SHOW TABLES;

-- Verificar estructura de roles
DESCRIBE roles;
SELECT * FROM roles;

-- Verificar estructura de users
DESCRIBE users;
SELECT id, name, email, username, active, role_id FROM users;

-- Verificar estructura de permissions
DESCRIBE permissions;
SELECT * FROM permissions;

-- Verificar estructura de role_has_permission
DESCRIBE role_has_permission;
SELECT * FROM role_has_permission;

-- Verificar que el usuario admin existe
SELECT 
    u.id,
    u.name,
    u.email,
    u.username,
    r.name as role_name,
    u.active
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.username = 'admin';

-- Verificar permisos del rol Administrador
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.detail,
    rhp.reading,
    rhp.writing
FROM role_has_permission rhp
JOIN roles r ON rhp.roles_id = r.id
JOIN permissions p ON rhp.permissions_id = p.id
WHERE r.id = 1;
