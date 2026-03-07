import * as fs from 'fs';
import * as path from 'path';

/**
 * Simple logging utility for the base template
 * Writes logs to data/logs directory
 */
export default class Logger {
    private logsDir: string;

    constructor() {
        this.logsDir = path.join(__dirname, '../data/logs');
        this.ensureLogsDirExists();
    }

    private ensureLogsDirExists(): void {
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }
    }

    /**
     * Write a log entry to a specific log file
     * @param logName - Name of the log file (without extension)
     * @param message - Message to log
     */
    public writeLog(logName: string, message: string): void {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        const logFilePath = path.join(this.logsDir, `${logName}.log`);

        try {
            fs.appendFileSync(logFilePath, logEntry, 'utf8');
        } catch (error) {
            console.error(`Failed to write log to ${logFilePath}:`, error);
        }
    }
}
