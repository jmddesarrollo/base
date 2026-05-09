import ControlException from '../../utils/controlException';

import UsersDAL from './users.dal';
import SecurityLogger, { SecurityEventType } from '../../utils/securityLogger';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

import momentTZ from 'moment-timezone';
import moment from 'moment';

export default class AuthService {
    private usersDAL = new UsersDAL();
    private securityLogger = new SecurityLogger();

    constructor() {}

    /**
     * Genera un payload JWT mínimo con solo los campos necesarios.
     * Requisitos 3.1, 3.2: excluye password, email, attempts, active y otros datos sensibles.
     */
    public buildMinimalPayload(user: any): { id: number; username: string; role_id: number } {
        return {
            id: user.id,
            username: user.username,
            role_id: user.role_id,
        };
    }

    public async login(userName: string, password: string, t: any, ip?: string) {

        if (!userName) { throw new ControlException('El nombre de usuario no puede estar vacío', 402); }
        if (!password) { throw new ControlException('La contraseña no puede estar vacía', 402); }
        
        const user = await this.usersDAL.getUserByNameOrEmail(userName);            
    
        // Verificar usuario
        if (!user) { throw new ControlException('El usuario no está registrado', 403); }
        if (!user.active) { throw new ControlException('El usuario está deshabilitado', 403); }

        // Al superar los tres intentos de acceso incorrectamente
        if (user.attempts >= 3) {
            momentTZ.tz.setDefault('Europe/Madrid');
            const today = momentTZ().format('YYYY-MM-DD HH:mm:ss');
            const dateMin = moment(today).subtract(1, 'minute').format('YYYY-MM-DD HH:mm:ss');

            const diff = moment(user.updatedAt).unix() - moment(dateMin).unix();
        
            if (diff > 0) {
                // Requisito 8.2: registrar bloqueo de cuenta
                this.securityLogger.log({
                    timestamp: new Date().toISOString(),
                    event: SecurityEventType.ACCOUNT_LOCKED,
                    username: userName,
                    ip,
                    result: 'FAILURE',
                    details: `Cuenta bloqueada. ${diff} segundos pendientes.`,
                });
                throw new ControlException(`El usuario está bloqueado durante un minuto por superar el número máximo de intentos fallidos (${diff} sg pendientes)`, 403);
            }   

            user.attempts = 0;
            await this.usersDAL.editUser(user, t);       
        }
        
        user.attempts ++;
        await this.usersDAL.editUser(user, t);
    
        // Verificar la contraseña
        if (!bcrypt.compareSync(password, user.password)) {
            // Requisito 8.1: registrar login fallido por contraseña incorrecta
            this.securityLogger.log({
                timestamp: new Date().toISOString(),
                event: SecurityEventType.LOGIN_FAILED,
                username: userName,
                ip,
                result: 'FAILURE',
                details: 'Contraseña incorrecta',
            });
            throw new ControlException('La contraseña no es correcta', 403);
        }

        user.attempts = 0;
        await this.usersDAL.editUser(user, t);
    
        // Quitar contraseña de objeto de salida
        user.password = undefined;

        // Requisito 3.1, 3.2: payload JWT mínimo (solo id, username, role_id)
        const payload = this.buildMinimalPayload(user);
        var token = jwt.sign({ user: payload }, process.env.APP_SEED, { expiresIn: process.env.APP_EXPIRATION_TOKEN });

        // Requisito 8.1: registrar login exitoso
        this.securityLogger.log({
            timestamp: new Date().toISOString(),
            event: SecurityEventType.LOGIN_SUCCESS,
            username: userName,
            ip,
            result: 'SUCCESS',
        });
    
        let data = new Object;
        data = {
            user,
            token
        }        
    
        return data;
    }
    
    // =====================================
    // Renovar el token
    // =====================================
    public async renewToken(req: any) {
        const user = await this.usersDAL.getUser(req.user.id); 
        user.password = undefined;

        // Requisito 3.1, 3.2: payload JWT mínimo
        const payload = this.buildMinimalPayload(user);
        var token = jwt.sign({ user: payload }, process.env.APP_SEED, { expiresIn: process.env.APP_EXPIRATION_TOKEN });

        let data = new Object;
        data = {
            user,
            token
        }
    
        return data;
    }

    // =====================================
    // Token para recuperar contraseña
    // =====================================
    public async recoveryToken(req: any): Promise<string> {
        // Requisito 3.1, 3.2: payload JWT mínimo también en token de recuperación
        const payload = this.buildMinimalPayload(req.user);
        const token = jwt.sign({ user: payload }, process.env.APP_SEED, { expiresIn: process.env.APP_EXPIRATION_TOKEN_RECOVERY });

        // Requisitos 5.1, 5.2, 5.5: guardar hash SHA-256 del token en BD (invalida el anterior automáticamente)
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const createdAt = new Date();
        await this.usersDAL.saveRecoveryToken(req.user.id, tokenHash, createdAt);

        // Requisito 8.6: registrar solicitud de recuperación
        this.securityLogger.log({
            timestamp: new Date().toISOString(),
            event: SecurityEventType.PASSWORD_RECOVERY_REQUESTED,
            username: req.user.username,
            result: 'SUCCESS',
        });

        return token;
    }

    // =====================================
    // Validar token de recuperación contra BD
    // =====================================
    /**
     * Requisitos 5.3, 5.6: verifica que el hash del token coincide con el almacenado en BD
     * y que no ha expirado según su timestamp de creación.
     */
    public async validateRecoveryToken(userId: number, token: string): Promise<void> {
        const tokenData = await this.usersDAL.getRecoveryTokenData(userId);

        if (!tokenData.hash || !tokenData.createdAt) {
            throw new ControlException('El enlace de recuperación no es válido', 401);
        }

        // Comparar SHA-256 del token recibido con el hash almacenado
        const receivedHash = crypto.createHash('sha256').update(token).digest('hex');
        if (receivedHash !== tokenData.hash) {
            throw new ControlException('El enlace de recuperación no es válido', 401);
        }

        // Requisito 5.6: verificar expiración por timestamp (1 hora)
        const expirationMs = 60 * 60 * 1000; // 1 hora en ms
        const elapsed = Date.now() - tokenData.createdAt.getTime();
        if (elapsed > expirationMs) {
            throw new ControlException('El enlace de recuperación ya ha expirado', 401);
        }
    }

    // =====================================
    // Consumir (invalidar) token de recuperación tras cambio de contraseña
    // =====================================
    /**
     * Requisito 5.4: elimina el hash del token de BD tras el cambio de contraseña exitoso.
     */
    public async consumeRecoveryToken(userId: number, username?: string): Promise<void> {
        await this.usersDAL.clearRecoveryToken(userId);

        // Requisito 8.5, 8.6: registrar completado de recuperación
        this.securityLogger.log({
            timestamp: new Date().toISOString(),
            event: SecurityEventType.PASSWORD_RECOVERY_COMPLETED,
            username,
            result: 'SUCCESS',
        });
    }

}