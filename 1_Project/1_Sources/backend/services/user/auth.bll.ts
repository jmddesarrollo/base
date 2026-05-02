import ControlException from '../../utils/controlException';

import UsersDAL from './users.dal';
import SecurityLogger, { SecurityEventType } from '../../utils/securityLogger';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
    public recoveryToken(req: any) {
        // Requisito 3.1, 3.2: payload JWT mínimo también en token de recuperación
        const payload = this.buildMinimalPayload(req.user);
        var token = jwt.sign({ user: payload }, process.env.APP_SEED, { expiresIn: process.env.APP_EXPIRATION_TOKEN_RECOVERY });
    
        return token;
    }

}