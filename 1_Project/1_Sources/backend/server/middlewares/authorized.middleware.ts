import { Socket } from 'socket.io';

import ControlException from '../../utils/controlException';
import SecurityLogger, { SecurityEventType } from '../../utils/securityLogger';

const jwt = require('jsonwebtoken');

import PermissionService from '../../services/permission';
import { UserService } from '../../services/user';

export default class AuthorizedMiddleware {
    private permissionService = new PermissionService();
    private userService = new UserService();
    private securityLogger = new SecurityLogger();

    constructor() {}

    /** Extrae la IP del socket de forma segura */
    private getIp(socket: Socket): string {
        return socket.handshake?.address || 'unknown';
    }

    // =====================================
    // Verificar token - Middleware
    // =====================================
    /**
     * Check pensado por si se usa middleware ('use') en server.ts antes del connect     
     */
    public checkTokenNameSpace = (socket: Socket, next: Function) => {
        if (socket.handshake.query && !socket.handshake.query.token) {            
            next(new Error('El usuario o contraseña no son correctos'));
        }
            
        const token = socket.handshake.query.token;

        if (!token) { 
            next(new Error('El usuario no ha iniciado sesión')); 
        }
    
        jwt.verify(token, process.env.APP_SEED, (err: any, decoded: any) => {
            if (err) {
                if (err.name && err.name === 'TokenExpiredError') {
                    next(new Error('El tiempo de conexión ha expirado'));                                      
                }

                next(new Error('El usuario o contraseña no son correctos'));               
            }
    
            socket.handshake.query.decoded = decoded;
    
            next();
        });
    }

    /**
     * Verificar token — consulta la BD para obtener datos actualizados del usuario.
     * Requisito 3.3: verifica que el usuario sigue activo en BD.
     */
    public async checkToken (token: string, socket: Socket, recovery: boolean = false): Promise<any> {        
        if (!token) {
            socket.emit("auth/logout", {});
            throw new ControlException('El usuario no tiene inicio de sesión', 401); 
        }

        const ip = this.getIp(socket);

        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.APP_SEED, async (err: any, decoded: any) => {
                if (err) {
                    if (err.name && err.name === 'TokenExpiredError') {
                        // Requisito 8.3: registrar token expirado
                        this.securityLogger.log({
                            timestamp: new Date().toISOString(),
                            event: SecurityEventType.TOKEN_EXPIRED,
                            ip,
                            result: 'FAILURE',
                            details: 'Token JWT expirado',
                        });
                        socket.emit("auth/logout", {});
                        if (recovery) return reject(new ControlException('El enlace de recuperación de la contraseña ha expirado', 401));
                        return reject(new ControlException('El tiempo de conexión ha expirado', 401));
                    }
                    // Requisito 8.3: registrar token inválido
                    this.securityLogger.log({
                        timestamp: new Date().toISOString(),
                        event: SecurityEventType.TOKEN_INVALID,
                        ip,
                        result: 'FAILURE',
                        details: err.message || 'Token JWT inválido',
                    });
                    socket.emit("auth/logout", {});
                    return reject(new ControlException('El usuario o contraseña no son correctos', 401));
                }

                // Requisito 3.3: consultar BD para obtener datos actualizados y verificar que el usuario sigue activo
                try {
                    const freshUser = await this.userService.getUser(decoded.user.id);
                    if (!freshUser || !freshUser.active) {
                        this.securityLogger.log({
                            timestamp: new Date().toISOString(),
                            event: SecurityEventType.ACCESS_DENIED,
                            username: decoded.user?.username,
                            ip,
                            result: 'FAILURE',
                            details: 'Usuario inactivo o no encontrado en BD',
                        });
                        socket.emit("auth/logout", {});
                        return reject(new ControlException('El usuario está deshabilitado o no existe', 401));
                    }
                    resolve(decoded);
                } catch (dbErr) {
                    socket.emit("auth/logout", {});
                    return reject(new ControlException('Error al verificar el usuario', 500));
                }
            });
        });
    }


    /**
     * Validar si el usuario tiene permiso   
     */
    public async isAllowed (tokenDecoded: any, permissionType: string, mode: string, socket: Socket) {
        let boolPermission: boolean = false;
        let permissions: any[];

        permissions = await this.permissionService.getPermissionsHasRoles();

        const user = await this.userService.getUser(tokenDecoded.user.id);

        for (let permission of permissions) {
            if (user.role_id === permission.roles_id && permissionType == permission.permissions_id) {
                if ( (mode === 'reading' && permission.reading) || permission.writing){
                    boolPermission = true;
                }                
            }            
        }

        if (!boolPermission) {
            // Requisito 8.4: registrar acceso denegado
            this.securityLogger.log({
                timestamp: new Date().toISOString(),
                event: SecurityEventType.ACCESS_DENIED,
                username: tokenDecoded.user?.username,
                ip: this.getIp(socket),
                result: 'FAILURE',
                details: `Permiso requerido: ${permissionType} (${mode})`,
            });
            socket.emit("auth/notAllowed", {mode});
            throw new ControlException('El usuario no tiene permiso para la petición', 405); 
        }

        return true;
    }

    /**
     * Validar si el usuario tiene permiso validando entre varios permisos
     */
     public async isAllowedMultiple (tokenDecoded: any, permissionTypes: string[], mode: string, socket: Socket) {
        let boolPermission: boolean = false;
        let permissions: any[];

        permissions = await this.permissionService.getPermissionsHasRoles();

        const user = await this.userService.getUser(tokenDecoded.user.id);
        
        for (const permissionType of permissionTypes) {

            for (let permission of permissions) {
                if (user.role_id === permission.roles_id && permissionType == permission.permissions_id) {
                    if ( (mode === 'reading' && permission.reading) || permission.writing) {
                        boolPermission = true;
                    }                
                }            
            }
        }

        if (!boolPermission) {
            // Requisito 8.4: registrar acceso denegado (múltiples permisos)
            this.securityLogger.log({
                timestamp: new Date().toISOString(),
                event: SecurityEventType.ACCESS_DENIED,
                username: tokenDecoded.user?.username,
                ip: this.getIp(socket),
                result: 'FAILURE',
                details: `Permisos requeridos: ${permissionTypes.join(', ')} (${mode})`,
            });
            socket.emit("auth/notAllowed", {mode});
            throw new ControlException('El usuario no tiene permiso para la petición', 405); 
        }

        return true;
    }    

}
