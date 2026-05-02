import express from 'express';
import http from 'http';
import cors from 'cors';

// Router
import { AuthRoutes } from '../routes/ws/auth.route';
import RateLimiter from './rateLimiter';
import { EmailRoutes } from '../routes/ws/email.route';
import { PermissionRoutes } from '../routes/ws/permission.route';
import { RoleRoutes } from '../routes/ws/role.route';
import { UserRoutes } from '../routes/ws/user.route';

const path = require('path');

/**
 * Valida la fortaleza de APP_SEED según el entorno.
 * Exportada para ser testeable de forma aislada.
 *
 * En producción: lanza Error si no cumple los requisitos.
 * En desarrollo: emite console.warn si no cumple, sin detener el arranque.
 *
 * Requisitos en producción:
 *  - Definida y no vacía
 *  - Longitud >= 32 caracteres
 *  - Contiene letras, números y caracteres especiales
 */
export function validateAppSeed(seed: string | undefined, env: string): void {
    if (!seed) {
        const msg = 'APP_SEED no está configurada. Define APP_SEED en el archivo .env';
        if (env === 'production') throw new Error(msg);
        console.warn(`[SECURITY WARNING] ${msg}`);
        return;
    }

    const issues: string[] = [];

    if (seed.length < 32) {
        issues.push('debe tener al menos 32 caracteres');
    }
    if (!/[a-zA-Z]/.test(seed)) {
        issues.push('debe contener al menos una letra');
    }
    if (!/[0-9]/.test(seed)) {
        issues.push('debe contener al menos un número');
    }
    if (!/[^a-zA-Z0-9]/.test(seed)) {
        issues.push('debe contener al menos un carácter especial');
    }

    if (issues.length > 0) {
        const msg = `APP_SEED insegura: ${issues.join(', ')}`;
        if (env === 'production') throw new Error(msg);
        console.warn(`[SECURITY WARNING] ${msg}`);
    }
}

/**
 * Parsea y valida la lista de orígenes CORS desde APP_CORS_ORIGINS.
 * Exportada para ser testeable de forma aislada.
 *
 * - En producción sin APP_CORS_ORIGINS: lanza Error y detiene el arranque.
 * - En desarrollo sin APP_CORS_ORIGINS: usa ['http://localhost:4200'] por defecto.
 * - Acepta lista separada por comas: "http://localhost:4200,https://miapp.com"
 */
export function parseCorsOrigins(originsEnv: string | undefined, env: string): string[] {
    if (!originsEnv || originsEnv.trim() === '') {
        if (env === 'production') {
            throw new Error(
                'APP_CORS_ORIGINS no está configurada en producción. ' +
                'Define los orígenes permitidos en el archivo .env (ej: APP_CORS_ORIGINS="https://miapp.com")'
            );
        }
        console.warn('[SECURITY WARNING] APP_CORS_ORIGINS no definida. Usando http://localhost:4200 por defecto.');
        return ['http://localhost:4200'];
    }

    return originsEnv
        .split(',')
        .map(o => o.trim())
        .filter(o => o.length > 0);
}

/**
 * Clase del Servidor. 
 * Default: Exportación única
 */
export default class Server {
    private static _instance: Server;

    public app: express.Application;
    public port: number;
    public url: string;

    // Configuración de la conexión de los sockets
    // Encargado de los eventos en los sockets: Escucha y emite
    public io: any;
    // Io necesita la configuración del servidor sobre el que va a correr
    // Pero Express e IO no son compatibles así que necesitan a un servidor intermediario: http
    private httpServer: http.Server;

    // private: Patrón Singleton para que el Server sea instanciado una única vez
    // y evitar otras instancias accidentales en la aplicación
    private constructor() {
        this.app = express();
        this.port = Number(process.env.APP_SERVER_PORT);
        this.url = process.env.APP_SERVER_URL || '0.0.0.0';

        // Validar APP_SEED antes de inicializar Socket.IO
        validateAppSeed(process.env.APP_SEED, process.env.APP_NODE_ENV || 'development');

        // Parsear orígenes CORS permitidos
        const corsOrigins = parseCorsOrigins(process.env.APP_CORS_ORIGINS, process.env.APP_NODE_ENV || 'development');

        // Configurar CORS para permitir conexiones desde el frontend
        this.app.use(cors({
            origin: corsOrigins,
            credentials: true
        }));

        this.httpServer = new http.Server(this.app);

        // Conexión Socket como Servidor con configuración CORS
        this.io = require("socket.io")(this.httpServer, { 
            path: "/" + process.env.APP_SERVICE_NAME,
            cors: {
                origin: corsOrigins,
                credentials: true
            }
        });

        this.configureHttpRoutes();
        this.listenSockets();

        // Servir archivos estáticos del frontend (solo en producción)
        if (process.env.APP_NODE_ENV === 'production') {
            this.app.use(express.static(path.resolve(__dirname, '../public')));
            this.app.use('*', express.static(path.resolve(__dirname, '../public/index.html')));
        }
    }

    // Patrón Singleton para devolver la instancia si no ha sido creada, sino devuelve la ya creada
    // static: método que puede ser llamado directamente haciendo referencia a la clase
    public static get instance() {
        return this._instance || (this._instance = new this());
    }

    private configureHttpRoutes() {
        // HTTP routes can be configured here if needed
    }

    private listenSockets() {
        console.log('*********');
        console.log('ENTORNO: ' + process.env.APP_NODE_ENV);
        console.log('PUERTO: ' + process.env.APP_SERVER_PORT);
        console.log('VERSION NODE: ' + process.version);
        console.log('*********');
        console.log('Escuchando conexiones');

        // Activar rate limiting en producción o si APP_RATE_LIMIT_ENABLED=true
        const rateLimitEnabled =
            process.env.APP_NODE_ENV === 'production' ||
            process.env.APP_RATE_LIMIT_ENABLED === 'true';

        if (rateLimitEnabled) {
            const rateLimiter = new RateLimiter();
            this.io.use(rateLimiter.middleware.bind(rateLimiter));
            console.log('[RateLimiter] Middleware activado');
        }

        this.io.on('connect', (socket: any) => {
            console.log('Cliente conectado v2: ' + socket.id);
                  
            AuthRoutes(socket); 
            EmailRoutes(socket);
            PermissionRoutes(socket);
            RoleRoutes(socket);
            UserRoutes(socket);

            socket.on('disconnect', () => {
                console.log('Cliente desconectado v2: ' + socket.id);
            });
        });
    }

    public start(callback: any) {
        this.httpServer.listen(this.port, process.env.APP_SERVER_URL, callback);
    }
}