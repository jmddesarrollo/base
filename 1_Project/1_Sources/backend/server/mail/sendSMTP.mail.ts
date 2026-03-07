import ControlException from '../../utils/controlException';
import Logger from '../../utils/logger';

const env = process.env.JMD_NODE_ENV || 'development';
const config = require('../../config/config')[env];

const nodemailer = require("nodemailer");

export default class mailSMTPClass {
    private mailConfig: any;
    private smtpTransport: any;

    private logger = new Logger();

    constructor() { }

    public async sendMailSMTP(message: any) {
        // En entorno de pruebas
        if (process.env.JMD_NODE_ENV !== 'production') {
            message.html = `<div>Correo originalmente dirigido a ${message.to}</div> <br>${message.html}`;
            message.to = config.emailTest;            
        }
        
        this.mailConfig = {
            host: process.env.JMD_MAILER_HOST,
            port: process.env.JMD_MAILER_PORT,
            secure: false,
            auth: {
                user: process.env.APP_MAILER_USER,
                pass: process.env.APP_MAILER_PASSWORD
            },
            connectionTimeout: 120000
        };

        this.smtpTransport = nodemailer.createTransport(this.mailConfig);

        await this.smtpTransport.sendMail(message, (error: any) => {
            if (error) {                
                if (error.response) {
                    this.logger.writeLog('mail', `Error. To: ${message.to}. Subject: ${message.subject}. Message: ${error.message}`);
                } else {
                    const errString = error.toString();

                    // TimeOut
                    const idx = errString.indexOf('Connection timeout');
                    if (idx >= 0) this.logger.writeLog('mail', `Error. To: ${message.to}. Subject: ${message.subject}. Message: Connection timeout` ); 

                    this.retrySendMail(this.mailConfig, message);
                }
            } else {
                this.logger.writeLog('mail', `Success. To: ${message.to}. Subject: ${message.subject}`);
            }
        });
    }

    /**
     * Reintento de envío de email
     * @param mailConfig 
     * @param message 
     */
    public async retrySendMail(mailConfig: any, message: any) {
        this.mailConfig.connectionTimeout = 180000;
        this.smtpTransport = nodemailer.createTransport(mailConfig, message);

        await this.smtpTransport.sendMail(message, (error: any) => {
            if (error) {
                if (error.response) {
                    this.logger.writeLog('mail', `Error Retry. To: ${message.to}. Subject: ${message.subject}. Message: ${error.message}`);                    
                } else {
                    const errString = error.toString();

                    // TimeOut
                    const idx = errString.indexOf('Connection timeout');
                    if (idx >= 0) this.logger.writeLog('mail', `Error Retry. To: ${message.to}. Subject: ${message.subject}. Message: Connection timeout` );                    
                }                               
            } else {
                this.logger.writeLog('mail', `Success. To: ${message.to}. Subject: ${message.subject}`);
            }
        });
    }

}
