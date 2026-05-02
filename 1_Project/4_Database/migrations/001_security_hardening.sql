-- =============================================================================
-- Migración 001: Security Hardening
-- Descripción: Cambios en la tabla `users` para soportar el endurecimiento
--              de seguridad de App Base.
--
-- Cambios incluidos:
--   1. Ampliar el tipo del campo `attempts` de TINYINT(1) a INT(11)
--      para soportar valores mayores que 9 sin desbordamiento.
--   2. Añadir campo `recovery_token_hash` (VARCHAR 64, nullable) para
--      almacenar el hash SHA-256 del token de recuperación de contraseña activo.
--   3. Añadir campo `recovery_token_created_at` (DATETIME, nullable) para
--      registrar cuándo se generó el token y poder verificar su expiración.
--
-- Requisitos: 10.1, 5.2
--
-- INSTRUCCIONES:
--   Ejecutar este script manualmente en la base de datos antes de arrancar
--   el servidor con los cambios del modelo de usuario.
--   Este script es idempotente: verifica que las columnas no existen antes
--   de añadirlas para evitar errores en ejecuciones repetidas.
-- =============================================================================

USE `app-base`;

-- -----------------------------------------------------------------------------
-- 1. Ampliar el campo `attempts` de TINYINT(1) a INT(11)
--    El campo TINYINT(1) solo soporta valores hasta 127 (signed) o 255 (unsigned),
--    pero la representación visual limita a 1 dígito. INT(11) soporta hasta
--    2.147.483.647, eliminando cualquier riesgo de desbordamiento en el contador
--    de intentos fallidos de login.
-- -----------------------------------------------------------------------------
ALTER TABLE `users`
  MODIFY COLUMN `attempts` INT(11) NOT NULL DEFAULT 0;

-- -----------------------------------------------------------------------------
-- 2. Añadir campo `recovery_token_hash` si no existe
--    Almacena el hash SHA-256 (64 caracteres hex) del token de recuperación
--    de contraseña activo. NULL indica que no hay token activo.
--    Al generar un nuevo token, el valor anterior se sobreescribe (invalidación).
-- -----------------------------------------------------------------------------
SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'users'
    AND COLUMN_NAME  = 'recovery_token_hash'
);

SET @sql = IF(
  @col_exists = 0,
  'ALTER TABLE `users` ADD COLUMN `recovery_token_hash` VARCHAR(64) NULL DEFAULT NULL',
  'SELECT ''recovery_token_hash ya existe, omitiendo'' AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------------------------------
-- 3. Añadir campo `recovery_token_created_at` si no existe
--    Almacena el timestamp de creación del token de recuperación activo.
--    Se usa junto con la expiración configurada para rechazar tokens caducados
--    aunque el JWT subyacente aún sea válido.
-- -----------------------------------------------------------------------------
SET @col_exists2 = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME   = 'users'
    AND COLUMN_NAME  = 'recovery_token_created_at'
);

SET @sql2 = IF(
  @col_exists2 = 0,
  'ALTER TABLE `users` ADD COLUMN `recovery_token_created_at` DATETIME NULL DEFAULT NULL',
  'SELECT ''recovery_token_created_at ya existe, omitiendo'' AS info'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- -----------------------------------------------------------------------------
-- Verificación final: mostrar la estructura actualizada de la tabla users
-- -----------------------------------------------------------------------------
DESCRIBE `users`;
