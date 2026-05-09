import ControlException from '../../utils/controlException';
import Logger from '../../utils/logger';

const env = process.env.APP_NODE_ENV || 'development';
const config = require('../../config/config')[env];

const nodemailer = require("nodemailer");

export default class mailSMTPClass {
    private mailConfig: any;
    private smtpTransport: any;

    private logger = new Logger();

    constructor() { }

    private buildMailError(error: any): ControlException {
        const message = process.env.APP_NODE_ENV === 'production'
            ? 'No se ha podido enviar el email. Revisa la configuración SMTP.'
            : `No se ha podido enviar el email. SMTP: ${error.message}`;

        return new ControlException(message, 500);
    }

    public async sendMailSMTP(message: any) {
        // En entorno de pruebas
        if (process.env.APP_NODE_ENV !== 'production') {
            message.html = `<div>Correo originalmente dirigido a ${message.to}</div> <br>${message.html}`;
            message.to = config.emailTest;            
        }
        
        this.mailConfig = {
            host: process.env.APP_MAILER_HOST,
            port: Number(process.env.APP_MAILER_PORT),
            secure: Number(process.env.APP_MAILER_PORT) === 465,
            auth: {
                user: process.env.APP_MAILER_USER,
                pass: process.env.APP_MAILER_PASSWORD
            },
            connectionTimeout: 120000
        };

        this.smtpTransport = nodemailer.createTransport(this.mailConfig);

        try {
            await this.smtpTransport.sendMail(message);
            this.logger.writeLog('mail', `Success. To: ${message.to}. Subject: ${message.subject}`);
        } catch (error: any) {
            const errString = error.toString();
            const isTimeout = errString.indexOf('Connection timeout') >= 0;

            this.logger.writeLog('mail', `Error. To: ${message.to}. Subject: ${message.subject}. Message: ${isTimeout ? 'Connection timeout' : error.message}`);

            if (isTimeout) {
                await this.retrySendMail(this.mailConfig, message);
                return;
            }

            throw this.buildMailError(error);
        }
    }

    /**
     * Reintento de envío de email
     * @param mailConfig 
     * @param message 
     */
    public async retrySendMail(mailConfig: any, message: any) {
        this.mailConfig.connectionTimeout = 180000;
        this.smtpTransport = nodemailer.createTransport(mailConfig, message);

        try {
            await this.smtpTransport.sendMail(message);
            this.logger.writeLog('mail', `Success. To: ${message.to}. Subject: ${message.subject}`);
        } catch (error: any) {
            const errString = error.toString();
            const isTimeout = errString.indexOf('Connection timeout') >= 0;

            this.logger.writeLog('mail', `Error Retry. To: ${message.to}. Subject: ${message.subject}. Message: ${isTimeout ? 'Connection timeout' : error.message}`);
            throw this.buildMailError(error);
        }
    }

}
